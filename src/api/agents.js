import { http } from './http'

export async function listAgents() {
  const { data } = await http.get('/api/agents')
  return data.agents || []
}

export async function getAgent(id) {
  const { data } = await http.get(`/api/agents/${encodeURIComponent(id)}`)
  return data.agent
}

