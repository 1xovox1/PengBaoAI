/**
 * 聊天接口：请求后端代理，由后端转发到各模型 API
 * 开发时通过 Vite 代理 /api -> 后端；生产时需配置 VITE_API_BASE_URL 或同域部署
 */
import { http } from './http'

/**
 * 发送对话到指定模型
 * @param {string} model - 模型 id：gpt-4 | kimi | claude-3 | deepseek | dify
 * @param {Array<{role:'user'|'assistant',content:string}>} messages
 * @param {number} maxTokens
 * @param {string} [conversationId] - 仅 model=dify 时有效，用于多轮对话同一会话
 * @returns {Promise<{content:string, conversation_id?: string}>}
 */
export async function sendChat(model, messages, maxTokens = 2000, conversationId = null) {
  const body = { model, messages, max_tokens: maxTokens }
  if (conversationId) body.conversation_id = conversationId
  const { data } = await http.post('/api/chat', body)
  return data
}
