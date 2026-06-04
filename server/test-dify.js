/**
 * 测试 Dify API 连接
 * 运行: node test-dify.js
 */
import 'dotenv/config'

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://flow.ecombus.net'
const DIFY_API_KEY = process.env.DIFY_API_KEY || 'app-uuCKLXjflL8j98Xf8xZLTw8J'

console.log('测试 Dify API 连接...')
console.log('Base URL:', DIFY_BASE_URL)
console.log('API Key:', DIFY_API_KEY.substring(0, 20) + '...')

// 测试端点 1: /v1/chat-messages (Chatflow)
async function testEndpoint1() {
  const url = `${DIFY_BASE_URL}/v1/chat-messages`
  console.log('\n测试端点 1:', url)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        query: '你好',
        inputs: {},
        user: 'test-user',
        response_mode: 'blocking',
      }),
    })
    const text = await res.text()
    console.log('状态码:', res.status)
    console.log('响应:', text.substring(0, 500))
    if (res.ok) {
      const data = JSON.parse(text)
      console.log('✅ 端点 1 成功! Answer:', data.answer?.substring(0, 100))
      return true
    }
  } catch (e) {
    console.log('❌ 端点 1 失败:', e.message)
  }
  return false
}

// 测试端点 2: /v1/messages (旧版可能用这个)
async function testEndpoint2() {
  const url = `${DIFY_BASE_URL}/v1/messages`
  console.log('\n测试端点 2:', url)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        query: '你好',
        user: 'test-user',
        response_mode: 'blocking',
      }),
    })
    const text = await res.text()
    console.log('状态码:', res.status)
    console.log('响应:', text.substring(0, 500))
    if (res.ok) {
      const data = JSON.parse(text)
      console.log('✅ 端点 2 成功! Answer:', data.answer?.substring(0, 100))
      return true
    }
  } catch (e) {
    console.log('❌ 端点 2 失败:', e.message)
  }
  return false
}

// 运行测试
async function run() {
  const result1 = await testEndpoint1()
  if (!result1) {
    await testEndpoint2()
  }
}

run().catch(console.error)
