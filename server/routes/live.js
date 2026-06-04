import { Router } from 'express'
import nodeFetch from 'node-fetch'
import Anthropic from '@anthropic-ai/sdk'
import { readJson, writeJson, nowIso, newId } from '../storage/jsonStore.js'

const router = Router()
const _fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : nodeFetch
const STORE = 'live_runs'

async function loadRuns() {
  return await readJson(STORE, [])
}
async function saveRuns(list) {
  await writeJson(STORE, list)
}

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

function promptPre({ title, platform, period, policyPrice, goods, trafficExpect, anchorState, goal }) {
  return `你是顶级直播运营总监 + 话术导演。请为“直播话术与节奏”生成可直接使用的模块化话术。\n\n要求：\n- 用中文\n- 输出必须是 JSON（不要用 Markdown 包裹）\n- 包含模块：开场、承接、卖点讲解（按货盘拆）、福利节奏、逼单、异议处理（至少10条）、场控提示、收尾。\n- 每个模块给“可直接照读”的话术 + 关键要点 + 可替换变量。\n\n直播信息：\n- 标题：${title || '未填'}\n- 平台：${platform || '未填'}\n- 周期/场次：${period || '未填'}\n- 目标：${goal || '未填'}\n\n政策/价格：\n${policyPrice || '(无)'}\n\n货盘/主推商品：\n${goods || '(无)'}\n\n流量预期：\n${trafficExpect || '(无)'}\n\n主播状态/人设：\n${anchorState || '(无)'}\n\n请输出 JSON：\n{\n  \"summary\": \"本场策略一句话\",\n  \"modules\": {\n    \"opening\": {\"script\": \"...\", \"notes\": [\"...\"]},\n    \"handoff\": {\"script\": \"...\", \"notes\": [\"...\"]},\n    \"goods\": [{\"sku\":\"...\",\"script\":\"...\",\"notes\":[\"...\"]}],\n    \"benefits\": {\"script\":\"...\",\"notes\":[\"...\"]},\n    \"closing\": {\"script\":\"...\",\"notes\":[\"...\"]},\n    \"objections\": [{\"q\":\"...\",\"a\":\"...\",\"notes\":[\"...\"]}],\n    \"control\": [\"场控提示...\"]\n  },\n  \"variables\": {\"var_name\":\"示例\"}\n}`
}

function promptReview({ title, platform, period, policyPrice, traffic, dataPerf, anchorScript, extra }) {
  return `你是资深直播复盘专家。请基于四因素（政策价格/流量/数据/主播状态与话术）做复盘，并输出“下次可执行改动清单”。\n\n要求：\n- 用中文\n- 输出必须是 JSON\n- 结论要可执行：哪些话术模块保留/删减/改写；哪些策略动作下次要做\n\n直播信息：\n- 标题：${title || '未填'}\n- 平台：${platform || '未填'}\n- 周期/场次：${period || '未填'}\n\n1) 政策价格：\n${policyPrice || '(无)'}\n\n2) 流量：\n${traffic || '(无)'}\n\n3) 数据表现：\n${dataPerf || '(无)'}\n\n4) 主播状态与话术：\n${anchorScript || '(无)'}\n\n补充：\n${extra || '(无)'}\n\n请输出 JSON：\n{\n  \"summary\": \"一句话复盘\",\n  \"insights\": [\"...\"],\n  \"issues\": [\"...\"],\n  \"next_actions\": [{\"priority\":\"P0\",\"owner\":\"运营\",\"item\":\"...\"}],\n  \"script_changes\": {\n    \"keep\": [\"保留模块...\"],\n    \"remove\": [\"删减模块...\"],\n    \"rewrite\": [{\"module\":\"...\",\"suggestion\":\"...\"}]\n  },\n  \"questions\": [\"下次需要补充的数据/问题...\"],\n  \"pre_prompt_for_next\": \"给播前生成的提示词（可直接粘贴）\"\n}`
}

async function generateByModel({ model, prompt, max_tokens = 2000 }) {
  const messages = [{ role: 'user', content: prompt }]
  if (String(model).startsWith('dify')) {
    const baseURL = process.env.DIFY_BASE_URL
    const apiKey = process.env.DIFY_API_KEY
    if (!baseURL || !apiKey) throw new Error('未配置 DIFY_BASE_URL / DIFY_API_KEY')
    const url = `${baseURL.replace(/\/$/, '')}/v1/chat-messages`
    const difyRes = await _fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query: prompt, user: 'pengbao-live', inputs: {}, response_mode: 'blocking' }),
    })
    if (!difyRes.ok) throw new Error(`Dify 请求失败: ${difyRes.status} ${await difyRes.text()}`)
    const data = await difyRes.json()
    const text = data.answer || ''
    if (!text) throw new Error('Dify 返回无 answer')
    return text
  }
  if (model === 'claude-3') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('未配置 ANTHROPIC_API_KEY')
    return await claudeChat({ apiKey, messages, max_tokens })
  }
  const cfg = OPENAI_COMPATIBLE[model]
  if (!cfg) throw new Error(`不支持的模型: ${model}`)
  const apiKey = process.env[cfg.apiKeyEnv]
  if (!apiKey) throw new Error(`未配置 ${cfg.apiKeyEnv}`)
  return await openaiCompatibleChat({ baseURL: cfg.baseURL, apiKey, model: cfg.modelName, messages, max_tokens })
}

router.get('/live/runs', async (req, res, next) => {
  try {
    res.json({ runs: await loadRuns() })
  } catch (e) {
    next(e)
  }
})

router.post('/live/runs', async (req, res, next) => {
  try {
    const body = req.body || {}
    const run = {
      id: newId('live'),
      title: String(body.title || '直播闭环'),
      platform: String(body.platform || ''),
      period: String(body.period || ''),
      goal: String(body.goal || ''),
      policyPrice: String(body.policyPrice || ''),
      goods: String(body.goods || ''),
      trafficExpect: String(body.trafficExpect || ''),
      anchorState: String(body.anchorState || ''),
      // review inputs
      traffic: String(body.traffic || ''),
      dataPerf: String(body.dataPerf || ''),
      anchorScript: String(body.anchorScript || ''),
      extra: String(body.extra || ''),
      pre: null,
      review: null,
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

router.post('/live/runs/:id/generate-pre', async (req, res, next) => {
  try {
    const { model = 'dify', max_tokens = 2000 } = req.body || {}
    const runs = await loadRuns()
    const idx = runs.findIndex((r) => r.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'run 不存在' })
    const run = runs[idx]

    const prompt = promptPre(run)
    const text = await generateByModel({ model, prompt, max_tokens })
    let pre = null
    try {
      pre = JSON.parse(text)
    } catch {
      pre = { summary: '模型输出不是严格 JSON，已以文本形式保存', raw: text }
    }
    const updated = { ...run, pre, updatedAt: nowIso() }
    runs[idx] = updated
    await saveRuns(runs)
    res.json({ run: updated })
  } catch (e) {
    next(e)
  }
})

router.post('/live/runs/:id/generate-review', async (req, res, next) => {
  try {
    const { model = 'dify', max_tokens = 2000, traffic, dataPerf, anchorScript, extra } = req.body || {}
    const runs = await loadRuns()
    const idx = runs.findIndex((r) => r.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'run 不存在' })
    const run = runs[idx]

    // 支持 body 传入复盘输入，用于生成并写回 run
    const reviewRun = {
      ...run,
      ...(traffic !== undefined && { traffic: String(traffic) }),
      ...(dataPerf !== undefined && { dataPerf: String(dataPerf) }),
      ...(anchorScript !== undefined && { anchorScript: String(anchorScript) }),
      ...(extra !== undefined && { extra: String(extra) }),
    }
    const prompt = promptReview(reviewRun)
    const text = await generateByModel({ model, prompt, max_tokens })
    let review = null
    try {
      review = JSON.parse(text)
    } catch {
      review = { summary: '模型输出不是严格 JSON，已以文本形式保存', raw: text }
    }
    const updated = {
      ...run,
      review,
      traffic: reviewRun.traffic ?? run.traffic,
      dataPerf: reviewRun.dataPerf ?? run.dataPerf,
      anchorScript: reviewRun.anchorScript ?? run.anchorScript,
      extra: reviewRun.extra ?? run.extra,
      updatedAt: nowIso(),
    }
    runs[idx] = updated
    await saveRuns(runs)
    res.json({ run: updated })
  } catch (e) {
    next(e)
  }
})

router.post('/live/runs/:id/backfill', async (req, res, next) => {
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

export { router as liveRoutes }

