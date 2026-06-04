import { Router } from 'express'
import nodeFetch from 'node-fetch'
import Anthropic from '@anthropic-ai/sdk'
import { readJson, writeJson, nowIso, newId } from '../storage/jsonStore.js'

const router = Router()
const _fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : nodeFetch
const STORE = 'ads_runs'

async function loadRuns() {
  return await readJson(STORE, [])
}
async function saveRuns(list) {
  await writeJson(STORE, list)
}

// Minimal model dispatch (copied/simplified from chat route)
async function openaiCompatibleChat({ baseURL, apiKey, model, messages, max_tokens = 2000 }) {
  const url = `${baseURL.replace(/\/$/, '')}/v1/chat/completions`
  const res = await _fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 请求失败: ${res.status} ${err}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (content == null) throw new Error('API 返回格式异常')
  return content
}

async function claudeChat({ apiKey, messages, max_tokens = 2000 }) {
  const client = new Anthropic({ apiKey })
  const anthropicMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: typeof m.content === 'string' ? m.content : String(m.content),
  }))
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens,
    messages: anthropicMessages,
  })
  const block = res.content?.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('Claude 返回无文本')
  return block.text
}

const OPENAI_COMPATIBLE = {
  'gpt-4': { baseURL: 'https://api.openai.com', apiKeyEnv: 'OPENAI_API_KEY', modelName: 'gpt-4o-mini' },
  kimi: { baseURL: 'https://api.moonshot.ai', apiKeyEnv: 'MOONSHOT_API_KEY', modelName: 'moonshot-v1-8k' },
  deepseek: { baseURL: 'https://api.deepseek.com', apiKeyEnv: 'DEEPSEEK_API_KEY', modelName: 'deepseek-chat' },
}

function buildPrompt({ platform, period, contextText, kpisText }) {
  return `你是资深投放分析师。请基于我提供的信息输出“日报/周报复盘”结构化结果，必须包含：insights、issues、actions、risks、questions。\n\n要求：\n- 用中文\n- insights/issues/actions 每项 3-8 条，尽量具体可执行\n- actions 必须是“明日/本周可执行动作清单”，包含优先级（P0/P1/P2）与负责人建议（如：投放/设计/运营）\n- 输出必须是 JSON（不要用 Markdown 包裹）\n\n背景：\n- 平台：${platform || '未指定'}\n- 周期：${period || '未指定'}\n\n关键数据（可能不完整）：\n${kpisText || '(无)'}\n\n补充上下文：\n${contextText || '(无)'}\n\n请输出 JSON：\n{\n  \"insights\": [\"...\"],\n  \"issues\": [\"...\"],\n  \"actions\": [{\"priority\":\"P0\",\"owner\":\"投放\",\"item\":\"...\"}],\n  \"risks\": [\"...\"],\n  \"questions\": [\"...\"],\n  \"summary\": \"一段话总结\"\n}`
}

router.get('/ads/runs', async (req, res, next) => {
  try {
    const runs = await loadRuns()
    res.json({ runs })
  } catch (e) {
    next(e)
  }
})

router.post('/ads/runs', async (req, res, next) => {
  try {
    const body = req.body || {}
    const run = {
      id: newId('ads'),
      title: String(body.title || '投放复盘'),
      platform: String(body.platform || ''),
      period: String(body.period || ''),
      fileIds: Array.isArray(body.fileIds) ? body.fileIds.map(String) : [],
      kpisText: String(body.kpisText || ''),
      contextText: String(body.contextText || ''),
      report: null,
      actionBackfill: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    const runs = await loadRuns()
    runs.unshift(run)
    await saveRuns(runs.slice(0, 1000))
    res.status(201).json({ run })
  } catch (e) {
    next(e)
  }
})

router.post('/ads/runs/:id/generate', async (req, res, next) => {
  try {
    const { model = 'dify', max_tokens = 2000 } = req.body || {}
    const runs = await loadRuns()
    const idx = runs.findIndex((r) => r.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'run 不存在' })
    const run = runs[idx]

    const prompt = buildPrompt(run)
    const messages = [{ role: 'user', content: prompt }]

    let text = ''
    // Dify (recommended in your org): reuse server/.env DIFY_BASE_URL + DIFY_API_KEY
    if (String(model).startsWith('dify')) {
      const baseURL = process.env.DIFY_BASE_URL
      const apiKey = process.env.DIFY_API_KEY
      if (!baseURL || !apiKey) {
        return res.status(502).json({ error: '未配置 DIFY_BASE_URL / DIFY_API_KEY，无法生成' })
      }
      const url = `${baseURL.replace(/\/$/, '')}/v1/chat-messages`
      const difyRes = await _fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ query: prompt, user: 'pengbao-ads', inputs: {}, response_mode: 'blocking' }),
      })
      if (!difyRes.ok) throw new Error(`Dify 请求失败: ${difyRes.status} ${await difyRes.text()}`)
      const data = await difyRes.json()
      text = data.answer || ''
      if (!text) throw new Error('Dify 返回无 answer')
    } else if (model === 'claude-3') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return res.status(502).json({ error: '未配置 ANTHROPIC_API_KEY' })
      text = await claudeChat({ apiKey, messages, max_tokens })
    } else {
      const cfg = OPENAI_COMPATIBLE[model]
      if (!cfg) return res.status(400).json({ error: `不支持的模型: ${model}` })
      const apiKey = process.env[cfg.apiKeyEnv]
      if (!apiKey) return res.status(502).json({ error: `未配置 ${cfg.apiKeyEnv}` })
      text = await openaiCompatibleChat({
        baseURL: cfg.baseURL,
        apiKey,
        model: cfg.modelName,
        messages,
        max_tokens,
      })
    }

    let report = null
    try {
      report = JSON.parse(text)
    } catch {
      report = { summary: '模型输出不是严格 JSON，已以文本形式保存', raw: text }
    }

    const updated = { ...run, report, updatedAt: nowIso() }
    runs[idx] = updated
    await saveRuns(runs)
    res.json({ run: updated })
  } catch (e) {
    next(e)
  }
})

router.post('/ads/runs/:id/backfill', async (req, res, next) => {
  try {
    const { items } = req.body || {}
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items 必须是数组' })
    const runs = await loadRuns()
    const idx = runs.findIndex((r) => r.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'run 不存在' })
    const run = runs[idx]
    const backfill = items.map((x) => ({
      id: x.id ? String(x.id) : newId('act'),
      item: String(x.item || ''),
      result: String(x.result || ''),
      owner: String(x.owner || ''),
      status: String(x.status || 'done'),
      time: nowIso(),
    }))
    const updated = {
      ...run,
      actionBackfill: [...backfill, ...(run.actionBackfill || [])].slice(0, 200),
      updatedAt: nowIso(),
    }
    runs[idx] = updated
    await saveRuns(runs)
    res.json({ run: updated })
  } catch (e) {
    next(e)
  }
})

export { router as adsRoutes }

