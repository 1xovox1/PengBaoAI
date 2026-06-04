/**
 * 鹏宝AI 后端代理服务
 * 作用：接收前端请求，根据模型选择对应厂商 API 转发，密钥只存在服务器，不暴露给前端
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { chatRoutes } from './routes/chat.js'
import { authRoutes } from './routes/auth.js'
import { agentsRoutes } from './routes/agents.js'
import { filesRoutes } from './routes/files.js'
import { adsRoutes } from './routes/ads.js'
import { liveRoutes } from './routes/live.js'
import { auditMiddleware } from './middleware/audit.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())

// Audit (best-effort, non-blocking)
app.use(auditMiddleware())

// Routes
app.use('/api', authRoutes)
app.use('/api', agentsRoutes)
app.use('/api', filesRoutes)
app.use('/api', adsRoutes)
app.use('/api', liveRoutes)
app.use('/api', chatRoutes)

app.get('/health', (req, res) => {
  res.json({ ok: true, message: '鹏宝AI 后端运行中' })
})

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err)
  res.status(500).json({
    error: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`鹏宝AI 后端已启动: http://localhost:${PORT}`)
  console.log('聊天接口: POST /api/chat')
})
