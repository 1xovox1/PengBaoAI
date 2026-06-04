import crypto from 'node:crypto'
import { readJson, writeJson, nowIso } from '../storage/jsonStore.js'

const TOKENS_STORE = 'auth_tokens'

export async function issueToken({ username, role }) {
  const token = crypto.randomBytes(24).toString('hex')
  const tokens = await readJson(TOKENS_STORE, [])
  tokens.unshift({
    token,
    username,
    role,
    createdAt: nowIso(),
    lastSeenAt: nowIso(),
  })
  // keep last 200 tokens to avoid unbounded growth
  await writeJson(TOKENS_STORE, tokens.slice(0, 200))
  return token
}

export async function getTokenRecord(token) {
  if (!token) return null
  const tokens = await readJson(TOKENS_STORE, [])
  const rec = tokens.find((t) => t.token === token)
  return rec || null
}

export async function touchToken(token) {
  const tokens = await readJson(TOKENS_STORE, [])
  const idx = tokens.findIndex((t) => t.token === token)
  if (idx === -1) return
  tokens[idx] = { ...tokens[idx], lastSeenAt: nowIso() }
  await writeJson(TOKENS_STORE, tokens)
}

function extractToken(req) {
  const auth = req.headers.authorization
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  const x = req.headers['x-auth-token']
  if (typeof x === 'string' && x.trim()) return x.trim()
  return null
}

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const token = extractToken(req)
      const rec = await getTokenRecord(token)
      if (!rec) return res.status(401).json({ error: '未登录或 token 无效' })
      req.user = { username: rec.username, role: rec.role }
      await touchToken(rec.token)
      return next()
    } catch (e) {
      return next(e)
    }
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role
    if (!role) return res.status(401).json({ error: '未登录' })
    if (roles.length === 0 || roles.includes(role)) return next()
    return res.status(403).json({ error: '权限不足' })
  }
}

