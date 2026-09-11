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

export async function getInvestigations() {
  const response = await fetcher('/v1/investigations')

  return response.data.investigations
}

export async function getInvestigation(id) {
  const response = await fetcher(`/v1/investigations/${id}`)

  return response.data
}

export async function getCurrentUser() {
  const response = await fetcher('/v1/auth/me')

  return response.data.user
}

export async function loginUser(credentials) {
  const response = await fetcher('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  return response.data.user
}

export async function signupUser(data) {
  const response = await fetcher('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return response.data.user
}
