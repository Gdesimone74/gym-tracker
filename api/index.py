from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timedelta
import os

from supabase import create_client, Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    return create_client(url, key)


class DailyLogCreate(BaseModel):
    date: date
    workout_completed: bool = False
    nutrition_completed: bool = False
    notes: Optional[str] = None


class DailyLogUpdate(BaseModel):
    workout_completed: Optional[bool] = None
    nutrition_completed: Optional[bool] = None
    notes: Optional[str] = None


def get_user_id_from_token(authorization: str) -> str:
    """Extract user_id from Supabase JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.replace("Bearer ", "")
    supabase = get_supabase()

    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/logs")
def get_logs(
    authorization: Optional[str] = Header(None),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    user_id = get_user_id_from_token(authorization)
    supabase = get_supabase()

    query = supabase.table("daily_logs").select("*").eq("user_id", user_id)

    if start_date:
        query = query.gte("date", start_date.isoformat())
    if end_date:
        query = query.lte("date", end_date.isoformat())

    result = query.order("date", desc=True).execute()
    return {"logs": result.data}


@app.post("/api/logs")
def create_or_update_log(
    log: DailyLogCreate,
    authorization: Optional[str] = Header(None)
):
    user_id = get_user_id_from_token(authorization)
    supabase = get_supabase()

    # Check if log exists for this date
    existing = supabase.table("daily_logs").select("*").eq("user_id", user_id).eq("date", log.date.isoformat()).execute()

    if existing.data:
        # Update existing
        result = supabase.table("daily_logs").update({
            "workout_completed": log.workout_completed,
            "nutrition_completed": log.nutrition_completed,
            "notes": log.notes
        }).eq("id", existing.data[0]["id"]).execute()
    else:
        # Create new
        result = supabase.table("daily_logs").insert({
            "user_id": user_id,
            "date": log.date.isoformat(),
            "workout_completed": log.workout_completed,
            "nutrition_completed": log.nutrition_completed,
            "notes": log.notes
        }).execute()

    return {"log": result.data[0] if result.data else None}


@app.get("/api/stats")
def get_stats(authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    supabase = get_supabase()

    # Get all logs ordered by date
    result = supabase.table("daily_logs").select("*").eq("user_id", user_id).order("date", desc=True).execute()

    logs = result.data

    if not logs:
        return {
            "total_days": 0,
            "workout_streak": 0,
            "nutrition_streak": 0,
            "total_workouts": 0,
            "total_nutrition": 0
        }

    # Calculate stats
    total_workouts = sum(1 for log in logs if log["workout_completed"])
    total_nutrition = sum(1 for log in logs if log["nutrition_completed"])

    # Calculate workout streak (consecutive days from today)
    workout_streak = 0
    today = date.today()
    check_date = today

    logs_by_date = {log["date"]: log for log in logs}

    while True:
        date_str = check_date.isoformat()
        if date_str in logs_by_date and logs_by_date[date_str]["workout_completed"]:
            workout_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    # Calculate nutrition streak
    nutrition_streak = 0
    check_date = today

    while True:
        date_str = check_date.isoformat()
        if date_str in logs_by_date and logs_by_date[date_str]["nutrition_completed"]:
            nutrition_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return {
        "total_days": len(logs),
        "workout_streak": workout_streak,
        "nutrition_streak": nutrition_streak,
        "total_workouts": total_workouts,
        "total_nutrition": total_nutrition
    }

