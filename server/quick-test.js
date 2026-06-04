/**
 * 快速测试脚本：检查后端配置和 Dify 连接
 * 运行: node quick-test.js
 */
import 'dotenv/config'

console.log('=== 鹏宝AI 后端配置检查 ===\n')

// 1. 检查环境变量
console.log('1. 环境变量检查:')
const baseURL = process.env.DIFY_BASE_URL
const apiKey = process.env.DIFY_API_KEY
console.log('  DIFY_BASE_URL:', baseURL || '❌ 未配置')
console.log('  DIFY_API_KEY:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ 未配置')
console.log('')

if (!baseURL || !apiKey) {
  console.log('❌ 配置不完整！请检查 server/.env 文件')
  process.exit(1)
}

// 2. 测试 Dify API 连接
console.log('2. 测试 Dify API 连接...')
const url = `${baseURL.replace(/\/$/, '')}/v1/chat-messages`
console.log('  请求 URL:', url)
console.log('  请求体:', JSON.stringify({
  query: '你好',
  user: 'test-user',
  response_mode: 'blocking',
}, null, 2))
console.log('')

const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000)

try {
  console.log('  正在发送请求...')
  const startTime = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: '你好',
      inputs: {},
      user: 'test-user',
      response_mode: 'blocking',
    }),
    signal: controller.signal,
  })
  clearTimeout(timeoutId)
  
  const duration = Date.now() - startTime
  console.log(`  响应时间: ${duration}ms`)
  console.log('  状态码:', res.status)
  
  const text = await res.text()
  console.log('  响应内容:', text.substring(0, 500))
  
  if (res.ok) {
    const data = JSON.parse(text)
    console.log('\n✅ Dify API 连接成功！')
    console.log('  返回的 answer:', data.answer?.substring(0, 100) || '无')
  } else {
    console.log('\n❌ Dify API 返回错误')
    try {
      const err = JSON.parse(text)
      console.log('  错误信息:', err)
    } catch {
      console.log('  错误文本:', text)
    }
  }
} catch (e) {
  clearTimeout(timeoutId)
  if (e.name === 'AbortError') {
    console.log('\n❌ 请求超时（30秒）')
    console.log('  可能原因:')
    console.log('    - Dify 服务响应慢')
    console.log('    - 网络连接问题')
    console.log('    - URL 不正确')
  } else {
    console.log('\n❌ 请求失败:', e.message)
    console.log('  错误堆栈:', e.stack)
  }
}
