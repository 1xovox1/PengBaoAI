import { http } from './http'

export async function cleanAdsDataFile(file, platform) {
  const form = new FormData()
  form.append('file', file)
  form.append('platform', platform)
  const { data } = await http.post('/api/files/clean-ads-data', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listAdsRuns() {
  const { data } = await http.get('/api/ads/runs')
  return data.runs || []
}

export async function createAdsRun(payload) {
  const { data } = await http.post('/api/ads/runs', payload)
  return data.run
}

export async function generateAdsRun(runId, payload) {
  const { data } = await http.post(`/api/ads/runs/${encodeURIComponent(runId)}/generate`, payload)
  return data.run
}

export async function backfillAdsRun(runId, items) {
  const { data } = await http.post(`/api/ads/runs/${encodeURIComponent(runId)}/backfill`, { items })
  return data.run
}

