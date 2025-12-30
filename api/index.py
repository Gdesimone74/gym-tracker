from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date, timedelta
import os
import requests
import jwt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")


class DailyLogCreate(BaseModel):
    date: date
    workout_completed: bool = False
    nutrition_completed: bool = False
    notes: Optional[str] = None


def get_user_id_and_token(authorization: str) -> tuple:
    """Extract user_id and token from Supabase JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.replace("Bearer ", "")

    try:
        # Decode JWT without verification (Supabase already verified it)
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get("sub"), token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def supabase_request(method: str, endpoint: str, user_token: str, data: dict = None, params: dict = None):
    """Make request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        json=data,
        params=params
    )

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json() if response.text else []


@app.get("/api/health")
def health_check():
    return {"status": "ok", "supabase_url": SUPABASE_URL[:30] + "..." if SUPABASE_URL else "not set"}


@app.get("/api/logs")
def get_logs(
    authorization: Optional[str] = Header(None),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    user_id, token = get_user_id_and_token(authorization)

    params = {"user_id": f"eq.{user_id}", "order": "date.desc"}

    if start_date:
        params["date"] = f"gte.{start_date.isoformat()}"
    if end_date:
        if "date" in params:
            params["date"] = f"gte.{start_date.isoformat()}"
            params["and"] = f"(date.lte.{end_date.isoformat()})"
        else:
            params["date"] = f"lte.{end_date.isoformat()}"

    logs = supabase_request("GET", "daily_logs", token, params=params)
    return {"logs": logs}


@app.post("/api/logs")
def create_or_update_log(
    log: DailyLogCreate,
    authorization: Optional[str] = Header(None)
):
    user_id, token = get_user_id_and_token(authorization)

    # Check if log exists for this date
    params = {"user_id": f"eq.{user_id}", "date": f"eq.{log.date.isoformat()}"}
    existing = supabase_request("GET", "daily_logs", token, params=params)

    if existing:
        # Update existing
        update_params = {"id": f"eq.{existing[0]['id']}"}
        result = supabase_request("PATCH", "daily_logs", token, data={
            "workout_completed": log.workout_completed,
            "nutrition_completed": log.nutrition_completed,
            "notes": log.notes
        }, params=update_params)
    else:
        # Create new
        result = supabase_request("POST", "daily_logs", token, data={
            "user_id": user_id,
            "date": log.date.isoformat(),
            "workout_completed": log.workout_completed,
            "nutrition_completed": log.nutrition_completed,
            "notes": log.notes
        })

    return {"log": result[0] if result else None}


@app.get("/api/stats")
def get_stats(authorization: Optional[str] = Header(None)):
    user_id, token = get_user_id_and_token(authorization)

    params = {"user_id": f"eq.{user_id}", "order": "date.desc"}
    logs = supabase_request("GET", "daily_logs", token, params=params)

    if not logs:
        return {
            "total_days": 0,
            "workout_streak": 0,
            "nutrition_streak": 0,
            "total_workouts": 0,
            "total_nutrition": 0
        }

    total_workouts = sum(1 for log in logs if log["workout_completed"])
    total_nutrition = sum(1 for log in logs if log["nutrition_completed"])

    # Calculate workout streak
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
