/**
 * 统一聊天接口：根据 model 转发到 OpenAI / Kimi / Claude / DeepSeek
 * 前端只传 model + messages，密钥由本服务从环境变量读取
 */
import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import nodeFetch from 'node-fetch'

const router = Router()
const _fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : nodeFetch

// OpenAI 兼容接口（OpenAI、Kimi、DeepSeek 通用）
async function openaiCompatibleChat({ baseURL, apiKey, model, messages, max_tokens = 2000 }) {
  const url = `${baseURL.replace(/\/$/, '')}/v1/chat/completions`
  const res = await _fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens,
    }),
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

// 各厂商配置：modelId -> { baseURL, apiKeyEnv, modelName }
const OPENAI_COMPATIBLE = {
  'gpt-4': {
    baseURL: 'https://api.openai.com',
    apiKeyEnv: 'OPENAI_API_KEY',
    modelName: 'gpt-4o-mini', // 可改为 gpt-4 / gpt-4-turbo
  },
  kimi: {
    baseURL: 'https://api.moonshot.ai',
    apiKeyEnv: 'MOONSHOT_API_KEY',
    modelName: 'moonshot-v1-8k',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    modelName: 'deepseek-chat',
  },
}

// Claude 单独处理（Anthropic 格式不同）
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

// Dify Agent/Chatflow：用你在 Dify 上创建的 Agent，无需单独配置各模型 API Key
async function difyChat({ baseURL, apiKey, query, conversationId = null, user = 'pengbao-user' }) {
  const url = `${baseURL.replace(/\/$/, '')}/v1/chat-messages`
  const body = {
    query,
    user,
    // 你的 Dify 要求 inputs 必填；无变量时传空对象即可
    inputs: {},
    response_mode: 'blocking',
  }
  if (conversationId) body.conversation_id = conversationId
  
  // 添加超时控制（120秒）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000)
  
  try {
    console.log('开始请求 Dify API:', url)
    const res = await _fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const errText = await res.text()
      let errJson
      try {
        errJson = JSON.parse(errText)
      } catch {
        errJson = { message: errText }
      }
      console.error('Dify API 错误响应:', { status: res.status, body: errJson })
      throw new Error(`Dify 请求失败 (${res.status}): ${errJson.message || errText}`)
    }
    
    const data = await res.json()
    console.log('Dify API 响应:', { hasAnswer: !!data.answer, hasConversationId: !!data.conversation_id })
    const answer = data.answer
    const newConversationId = data.conversation_id || null
    if (answer == null) {
      console.error('Dify 返回数据:', JSON.stringify(data, null, 2))
      throw new Error('Dify 返回无 answer 字段')
    }
    return { content: answer, conversation_id: newConversationId }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      console.error('Dify 请求超时（120秒）')
      throw new Error('Dify 请求超时，请检查网络连接或 Dify 服务状态')
    }
    if (e.message.includes('Dify 请求失败')) throw e
    console.error('Dify fetch 异常:', e.message)
    console.error('异常堆栈:', e.stack)
    throw new Error(`Dify 网络错误: ${e.message}`)
  }
}

/**
 * POST /api/chat
 * Body: { model, messages: [{ role, content }], max_tokens?, conversation_id? }
 * model 支持: gpt-4, kimi, claude-3, deepseek, dify
 * 当 model=dify 时，可选传 conversation_id 以延续同一会话
 */
router.post('/chat', async (req, res) => {
  const startTime = Date.now()
  console.log(`\n[${new Date().toLocaleTimeString()}] 收到请求:`, { model: req.body.model, messagesCount: req.body.messages?.length })
  try {
    const { model, messages, max_tokens = 2000, conversation_id: conversationId } = req.body
    if (!model || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '缺少 model 或 messages' })
    }

    // Dify Agent（支持多个模型，根据 model id 选择对应的 API Key）
    const DIFY_MODELS = {
      'dify-deepseek-v3': 'DIFY_API_KEY_DEEPSEEK_V3',
      'dify-deepseek-terminus': 'DIFY_API_KEY_DEEPSEEK_TERMINUS',
      'dify-qwen3': 'DIFY_API_KEY_QWEN3',
      'dify-doubao': 'DIFY_API_KEY_DOUBAO',
      'dify-kimi-k25': 'DIFY_API_KEY_KIMI_K25',
      'dify-glm47': 'DIFY_API_KEY_GLM47',
      'dify': 'DIFY_API_KEY', // 默认/兼容旧代码
    }
    
    if (DIFY_MODELS[model]) {
      const baseURL = process.env.DIFY_BASE_URL
      const apiKeyEnv = DIFY_MODELS[model]
      const apiKey = process.env[apiKeyEnv]
      console.log('Dify 配置检查:', { model, baseURL: baseURL ? '已配置' : '未配置', apiKeyEnv, apiKey: apiKey ? '已配置' : '未配置' })
      if (!baseURL || !apiKey) {
        return res.status(502).json({
          error: `未配置 Dify ${model}。请在 server/.env 中设置 DIFY_BASE_URL 和 ${apiKeyEnv}`,
        })
      }
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
      const query = lastUserMessage ? lastUserMessage.content : ''
      if (!query.trim()) return res.status(400).json({ error: '无法从 messages 中获取用户输入' })
      console.log('调用 Dify API:', { model, url: `${baseURL}/v1/chat-messages`, query: query.substring(0, 50) + '...' })
      const result = await difyChat({
        baseURL,
        apiKey,
        query,
        conversationId: conversationId || undefined,
      })
      const duration = Date.now() - startTime
      console.log(`✅ Dify 请求成功，耗时: ${duration}ms`)
      return res.json({
        content: result.content,
        conversation_id: result.conversation_id || undefined,
      })
    }

    // Claude
    if (model === 'claude-3') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return res.status(502).json({ error: '未配置 Claude API Key，请在 server/.env 中设置 ANTHROPIC_API_KEY' })
      const text = await claudeChat({ apiKey, messages, max_tokens })
      return res.json({ content: text })
    }

    // OpenAI 兼容（OpenAI、Kimi、DeepSeek）
    const config = OPENAI_COMPATIBLE[model]
    if (!config) {
      return res.status(400).json({
        error: `不支持的模型: ${model}。当前支持: gpt-4, kimi, claude-3, deepseek, dify, dify-deepseek-v3, dify-deepseek-terminus, dify-qwen3, dify-doubao, dify-kimi-k25, dify-glm47`,
      })
    }
    const apiKey = process.env[config.apiKeyEnv]
    if (!apiKey) {
      return res.status(502).json({
        error: `未配置 ${model} 的 API Key，请在 server/.env 中设置 ${config.apiKeyEnv}`,
      })
    }
    const content = await openaiCompatibleChat({
      baseURL: config.baseURL,
      apiKey,
      model: config.modelName,
      messages,
      max_tokens,
    })
    return res.json({ content })
  } catch (e) {
    const duration = Date.now() - startTime
    console.error(`❌ /api/chat 错误 (耗时: ${duration}ms):`, e.message)
    console.error('错误堆栈:', e.stack)
    console.error('请求参数:', { model: req.body.model, messagesCount: req.body.messages?.length })
    return res.status(500).json({
      error: e.message || '模型服务暂时不可用',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined,
    })
  }
})

// 测试端点：检查 Dify 配置
router.get('/test-dify', async (req, res) => {
  try {
    const baseURL = process.env.DIFY_BASE_URL
    const apiKey = process.env.DIFY_API_KEY
    return res.json({
      configured: !!(baseURL && apiKey),
      baseURL: baseURL || '未配置',
      apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : '未配置',
      testUrl: baseURL ? `${baseURL}/v1/chat-messages` : 'N/A',
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
})

export { router as chatRoutes }
