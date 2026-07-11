const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function fetcher(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const error = new Error('API request failed')
    error.status = response.status
    error.body = await response.json().catch(() => null)
    throw error
  }

  return response.json()
}
