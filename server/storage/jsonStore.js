import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), 'data')

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`)
}

export async function readJson(name, fallbackValue) {
  await ensureDir()
  const p = filePath(name)
  try {
    const raw = await fs.readFile(p, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    if (e.code === 'ENOENT') return fallbackValue
    throw e
  }
}

export async function writeJson(name, value) {
  await ensureDir()
  const p = filePath(name)
  const raw = JSON.stringify(value, null, 2)
  await fs.writeFile(p, raw, 'utf-8')
}

export function nowIso() {
  return new Date().toISOString()
}

export function newId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

