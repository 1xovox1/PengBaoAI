import { readJson, writeJson, nowIso, newId } from '../storage/jsonStore.js'

const AUDIT_STORE = 'audit_logs'

export function auditMiddleware() {
  return async (req, res, next) => {
    const start = Date.now()
    const reqId = newId('req')

    // Avoid logging huge bodies; keep safe subset.
    const safeBody =
      req.body && typeof req.body === 'object'
        ? {
            ...('model' in req.body ? { model: req.body.model } : {}),
            ...('agentId' in req.body ? { agentId: req.body.agentId } : {}),
            ...('conversation_id' in req.body ? { conversation_id: req.body.conversation_id } : {}),
            ...('messages' in req.body && Array.isArray(req.body.messages)
              ? { messagesCount: req.body.messages.length }
              : {}),
            ...('filename' in req.body ? { filename: req.body.filename } : {}),
          }
        : undefined

    res.on('finish', async () => {
      try {
        const logs = await readJson(AUDIT_STORE, [])
        logs.unshift({
          id: reqId,
          time: nowIso(),
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          ms: Date.now() - start,
          ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
          user: req.user || null,
          body: safeBody,
        })
        await writeJson(AUDIT_STORE, logs.slice(0, 2000))
      } catch {
        // Don't break request on audit failures
      }
    })

    next()
  }
}

