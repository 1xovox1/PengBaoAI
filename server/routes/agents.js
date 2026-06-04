import { Router } from 'express'
import { readJson, writeJson, nowIso, newId } from '../storage/jsonStore.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const STORE = 'agents'

function seedAgents() {
  return [
    {
      id: 'agent_promo_copy',
      slug: 'promo-copy',
      name: '促销文案生成器',
      description: '根据产品参数自动生成促销文案，支持多种风格',
      department: '电商运营组',
      capability: '文案生成',
      icon: 'Document',
      usageCount: 2341,
      rating: 4.8,
      isFavorite: false,
      tags: ['热门', '推荐'],
      appType: 'internal',
      appUrl: null,
      modules: ['生成器', '模板库', '历史记录'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'agent_report_analysis',
      slug: 'report-analysis',
      name: '数据报表分析',
      description: '自动分析销售数据，生成可视化报表',
      department: '电商运营组',
      capability: '数据拆解',
      icon: 'DataAnalysis',
      usageCount: 1856,
      rating: 4.9,
      isFavorite: true,
      tags: ['专业'],
      appType: 'internal',
      appUrl: null,
      modules: ['数据导入', '分析报告', '导出分享'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'agent_competitor_monitor',
      slug: 'competitor-monitor',
      name: '竞品价格监控',
      description: '实时监控竞品价格变化，自动生成对比报告',
      department: '市场推广组',
      capability: '竞品监控',
      icon: 'Monitor',
      usageCount: 1245,
      rating: 4.7,
      isFavorite: false,
      tags: ['实用'],
      appType: 'internal',
      appUrl: null,
      modules: ['监控看板', '监控规则', '订阅提醒', '对比报告'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'agent_poster_script',
      slug: 'poster-script',
      name: '海报脚本生成',
      description: '一键生成产品海报的文案脚本',
      department: '视觉设计组',
      capability: '脚本排版',
      icon: 'Picture',
      usageCount: 987,
      rating: 4.6,
      isFavorite: false,
      tags: [],
      appType: 'internal',
      appUrl: null,
      modules: ['脚本生成', '排版建议', '素材清单'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'agent_cs_reply',
      slug: 'cs-reply',
      name: '客服话术助手',
      description: '根据客户问题自动生成专业回复话术',
      department: '售后服务组',
      capability: '文案生成',
      icon: 'Service',
      usageCount: 2134,
      rating: 4.8,
      isFavorite: true,
      tags: ['热门'],
      appType: 'internal',
      appUrl: null,
      modules: ['问答生成', '语气/合规', '质检抽查'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'agent_spec_extract',
      slug: 'spec-extract',
      name: '产品参数提取',
      description: '从文档中自动提取产品参数并格式化',
      department: '产品研发组',
      capability: '数据拆解',
      icon: 'DocumentCopy',
      usageCount: 756,
      rating: 4.5,
      isFavorite: false,
      tags: [],
      appType: 'internal',
      appUrl: null,
      modules: ['文档解析', '字段映射', '导出'],
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]
}

async function loadAgents() {
  return await readJson(STORE, seedAgents())
}

async function saveAgents(list) {
  await writeJson(STORE, list)
}

// Public list (only active)
router.get('/agents', async (req, res, next) => {
  try {
    const agents = await loadAgents()
    const active = agents.filter((a) => (a.status || 'active') === 'active')
    res.json({ agents: active })
  } catch (e) {
    next(e)
  }
})

router.get('/agents/:id', async (req, res, next) => {
  try {
    const agents = await loadAgents()
    const a = agents.find((x) => x.id === req.params.id)
    if (!a) return res.status(404).json({ error: 'Agent 不存在' })
    if ((a.status || 'active') !== 'active') return res.status(404).json({ error: 'Agent 已下线' })
    return res.json({ agent: a })
  } catch (e) {
    next(e)
  }
})

// Admin CRUD
router.get('/admin/agents', requireAuth(), requireRole(['admin']), async (req, res, next) => {
  try {
    const agents = await loadAgents()
    res.json({ agents })
  } catch (e) {
    next(e)
  }
})

router.post('/admin/agents', requireAuth(), requireRole(['admin']), async (req, res, next) => {
  try {
    const agents = await loadAgents()
    const body = req.body || {}
    const id = body.id ? String(body.id) : newId('agent')
    if (agents.some((a) => a.id === id)) return res.status(409).json({ error: 'id 已存在' })
    if (!body.slug || !body.name) return res.status(400).json({ error: '缺少 slug 或 name' })

    const now = nowIso()
    const agent = {
      id,
      slug: String(body.slug),
      name: String(body.name),
      description: String(body.description || ''),
      department: String(body.department || ''),
      capability: String(body.capability || ''),
      icon: String(body.icon || 'Document'),
      usageCount: Number(body.usageCount || 0),
      rating: Number(body.rating || 0),
      isFavorite: !!body.isFavorite,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      appType: body.appType === 'external' ? 'external' : 'internal',
      appUrl: body.appUrl ? String(body.appUrl) : null,
      modules: Array.isArray(body.modules) ? body.modules.map(String) : [],
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: now,
      updatedAt: now,
    }
    agents.unshift(agent)
    await saveAgents(agents)
    res.status(201).json({ agent })
  } catch (e) {
    next(e)
  }
})

router.put('/admin/agents/:id', requireAuth(), requireRole(['admin']), async (req, res, next) => {
  try {
    const agents = await loadAgents()
    const idx = agents.findIndex((a) => a.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Agent 不存在' })
    const body = req.body || {}
    const now = nowIso()
    const updated = {
      ...agents[idx],
      ...body,
      id: agents[idx].id,
      updatedAt: now,
    }
    agents[idx] = updated
    await saveAgents(agents)
    res.json({ agent: updated })
  } catch (e) {
    next(e)
  }
})

router.delete('/admin/agents/:id', requireAuth(), requireRole(['admin']), async (req, res, next) => {
  try {
    const agents = await loadAgents()
    const idx = agents.findIndex((a) => a.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Agent 不存在' })
    const now = nowIso()
    agents[idx] = { ...agents[idx], status: 'inactive', updatedAt: now }
    await saveAgents(agents)
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export { router as agentsRoutes }

