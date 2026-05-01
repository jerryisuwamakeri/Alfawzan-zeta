const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function removeToken() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      )
    ).toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // also sends httpOnly cookie when available
  })

  if (res.status === 401) {
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed') as Error & {
      errors?: Record<string, string[]>
      status?: number
    }
    err.errors = data.errors
    err.status = res.status
    throw err
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}
