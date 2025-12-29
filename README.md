# Gym Tracker

Aplicación para seguimiento de rutina de gimnasio y alimentación.

## Setup

### 1. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a **SQL Editor** y ejecutar:

```sql
-- Crear tabla daily_logs
CREATE TABLE daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_completed BOOLEAN DEFAULT FALSE,
    nutrition_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven sus propios datos
CREATE POLICY "Users can view own logs"
    ON daily_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
    ON daily_logs FOR UPDATE
    USING (auth.uid() = user_id);
```

### 2. Configurar Google Auth en Supabase

1. Ir a **Authentication > Providers > Google**
2. Habilitar Google
3. Crear credenciales en [Google Cloud Console](https://console.cloud.google.com/):
   - Crear proyecto (o usar existente)
   - APIs & Services > Credentials > Create Credentials > OAuth Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copiar Client ID y Client Secret a Supabase

### 3. Configurar el proyecto

1. Copiar URL y anon key de Supabase (Settings > API)
2. Editar `static/js/auth.js`:
   ```js
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_ANON_KEY = 'tu-anon-key';
   ```
3. Crear archivo `.env` para el backend:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-anon-key
   ```

### 4. Deploy en Vercel

1. Subir a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create gym-tracker --public --source=. --push
   ```

2. En [vercel.com](https://vercel.com):
   - Import proyecto desde GitHub
   - Agregar variables de entorno:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
   - Deploy

3. Actualizar redirect URI en Google Cloud Console con la URL de Vercel

## Desarrollo local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Correr con Vercel CLI
npm i -g vercel
vercel dev
```
