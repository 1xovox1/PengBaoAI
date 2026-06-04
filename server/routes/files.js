import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { readJson, writeJson, nowIso, newId } from '../storage/jsonStore.js'
import { cleanAdsData } from '../services/dataCleaner.js'

const router = Router()
const STORE = 'files'

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
}

function getFileType(filename) {
  const ext = String(filename).split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return 'PDF'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'Excel'
  if (['doc', 'docx'].includes(ext)) return 'Word'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return '图片'
  return ext ? ext.toUpperCase() : '其他'
}

function formatFileSize(bytes) {
  const n = Number(bytes || 0)
  if (n <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  const v = Math.round((n / Math.pow(k, i)) * 100) / 100
  return `${v} ${sizes[i]}`
}

async function loadFiles() {
  return await readJson(STORE, [])
}

async function saveFiles(list) {
  await writeJson(STORE, list)
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir()
      cb(null, UPLOAD_DIR)
    } catch (e) {
      cb(e)
    }
  },
  filename: (req, file, cb) => {
    const id = newId('file')
    const ext = path.extname(file.originalname || '')
    cb(null, `${id}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
})

const uploadMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

/**
 * POST /api/upload
 * multipart/form-data: file
 * ElementPlus el-upload expects 200 with any JSON.
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const f = req.file
    if (!f) return res.status(400).json({ error: '未收到文件' })

    const files = await loadFiles()
    const record = {
      id: path.parse(f.filename).name, // file_xxx
      originalName: f.originalname,
      name: f.originalname,
      storageName: f.filename,
      mime: f.mimetype,
      sizeBytes: f.size,
      size: formatFileSize(f.size),
      type: getFileType(f.originalname),
      uploadTime: new Date().toLocaleString(),
      createdAt: nowIso(),
    }
    files.unshift(record)
    await saveFiles(files.slice(0, 5000))

    return res.json({ ok: true, file: record })
  } catch (e) {
    next(e)
  }
})

/**
 * POST /api/files/clean-ads-data
 * multipart: file (Excel), platform (抖音/天猫/京东/小红书)
 * 返回清洗后的 kpisText 和摘要，供投放闭环粘贴使用
 */
router.post('/files/clean-ads-data', uploadMemory.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ error: '请上传 Excel 文件' })
    const platform = (req.body && req.body.platform) || '抖音'
    const result = await cleanAdsData({ platform, excelBuffer: req.file.buffer })
    res.json(result)
  } catch (e) {
    next(e)
  }
})

// GET /api/files
router.get('/files', async (req, res, next) => {
  try {
    const files = await loadFiles()
    res.json({ files })
  } catch (e) {
    next(e)
  }
})

// GET /api/files/:id/download
router.get('/files/:id/download', async (req, res, next) => {
  try {
    const files = await loadFiles()
    const rec = files.find((x) => x.id === req.params.id)
    if (!rec) return res.status(404).json({ error: '文件不存在' })
    const p = path.join(UPLOAD_DIR, rec.storageName)
    return res.download(p, rec.originalName)
  } catch (e) {
    next(e)
  }
})

// DELETE /api/files/:id
router.delete('/files/:id', async (req, res, next) => {
  try {
    const files = await loadFiles()
    const idx = files.findIndex((x) => x.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: '文件不存在' })
    const rec = files[idx]
    files.splice(idx, 1)
    await saveFiles(files)
    try {
      await fs.unlink(path.join(UPLOAD_DIR, rec.storageName))
    } catch {
      // ignore
    }
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export { router as filesRoutes }

