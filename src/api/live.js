import { http } from './http'

export async function listLiveRuns() {
  const { data } = await http.get('/api/live/runs')
  return data.runs || []
}

export async function createLiveRun(payload) {
  const { data } = await http.post('/api/live/runs', payload)
  return data.run
}

export async function generatePre(runId, payload) {
  const { data } = await http.post(`/api/live/runs/${encodeURIComponent(runId)}/generate-pre`, payload)
  return data.run
}

export async function generateReview(runId, payload) {
  const { data } = await http.post(`/api/live/runs/${encodeURIComponent(runId)}/generate-review`, payload)
  return data.run
}

export async function backfillLiveRun(runId, items) {
  const { data } = await http.post(`/api/live/runs/${encodeURIComponent(runId)}/backfill`, { items })
  return data.run
}

