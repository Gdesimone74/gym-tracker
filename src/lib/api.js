import { supabase } from './supabase'

const API_BASE = '/api'

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken()

  if (!token) {
    throw new Error('No auth token')
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `API error: ${response.status}`)
  }

  return response.json()
}

export async function getLogs(startDate, endDate) {
  let url = '/logs'
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (params.toString()) url += `?${params.toString()}`

  return apiRequest(url)
}

export async function saveLog(log) {
  return apiRequest('/logs', {
    method: 'POST',
    body: JSON.stringify(log)
  })
}

export async function deleteLog(date) {
  return apiRequest(`/logs/${date}`, {
    method: 'DELETE'
  })
}

export async function getStats() {
  return apiRequest('/stats')
}
