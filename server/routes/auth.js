import { Router } from 'express'
import { issueToken } from '../middleware/auth.js'

const router = Router()

/**
 * POST /api/auth/login
 * Body: { password, username? }
 * Uses env AUTH_PASSWORD for a simple internal login.
 */
router.post('/auth/login', async (req, res) => {
  const { password, username } = req.body || {}
  const expected = process.env.AUTH_PASSWORD

  if (!expected) {
    return res.status(500).json({
      error: '服务器未配置 AUTH_PASSWORD（请在 server/.env 设置）',
    })
  }

  if (!password || String(password) !== String(expected)) {
    return res.status(401).json({ error: '口令错误' })
  }

  const token = await issueToken({
    username: username ? String(username) : 'internal-user',
    role: 'admin',
  })

  return res.json({ token, role: 'admin' })
})

export { router as authRoutes }

