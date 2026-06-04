import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

export function getAuthToken() {
  return localStorage.getItem('PENGBAO_AUTH_TOKEN') || ''
}

export function setAuthToken(token) {
  if (!token) localStorage.removeItem('PENGBAO_AUTH_TOKEN')
  else localStorage.setItem('PENGBAO_AUTH_TOKEN', token)
}

export async function login({ username, password }) {
  const { data } = await client.post('/api/auth/login', { username, password })
  if (data?.token) setAuthToken(data.token)
  return data
}

