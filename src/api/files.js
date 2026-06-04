import { http } from './http'

export async function listFiles() {
  const { data } = await http.get('/api/files')
  return data.files || []
}

export function downloadUrl(fileId) {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return `${base}/api/files/${encodeURIComponent(fileId)}/download`
}

export async function deleteFile(fileId) {
  const { data } = await http.delete(`/api/files/${encodeURIComponent(fileId)}`)
  return data
}

