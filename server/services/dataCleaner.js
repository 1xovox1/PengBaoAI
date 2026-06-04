/**
 * 数据清洗服务
 * 作用：清洗和标准化来自不同平台/来源的数据
 * 
 * 使用场景：
 * 1. 投放数据清洗：多平台 Excel → 统一字段 → 提取关键指标
 * 2. 直播数据清洗：流量数据、数据表现、主播话术的清洗与标准化
 */

import XLSX from 'xlsx'

/**
 * 清洗投放数据（多平台 Excel）
 * 
 * @param {Object} options
 * @param {string} options.platform - 平台（抖音/天猫/京东/小红书）
 * @param {Buffer} options.excelBuffer - Excel 文件的 Buffer
 * @returns {Promise<Object>} { cleanedData, kpisText }
 */
export async function cleanAdsData({ platform, excelBuffer }) {
  // 读取 Excel
  const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (!rawData || rawData.length === 0) {
    throw new Error('Excel 文件为空或格式不正确')
  }

  // 字段映射配置（按平台）
  const FIELD_MAPPING = {
    抖音: {
      消耗: '花费',
      消耗金额: '花费',
      花费: '花费',
      ROI: 'ROI',
      投资回报率: 'ROI',
      转化: '转化',
      转化数: '转化',
      点击率: '点击率',
      CTR: '点击率',
      成本: '成本',
      CPC: '成本',
      素材: '素材',
      创意: '素材',
    },
    天猫: {
      花费: '花费',
      消耗: '花费',
      ROI: 'ROI',
      投资回报率: 'ROI',
      转化: '转化',
      转化数: '转化',
      点击率: '点击率',
      CTR: '点击率',
      成本: '成本',
      CPC: '成本',
      素材: '素材',
      创意: '素材',
    },
    京东: {
      花费: '花费',
      消耗: '花费',
      ROI: 'ROI',
      投资回报率: 'ROI',
      转化: '转化',
      转化数: '转化',
      点击率: '点击率',
      CTR: '点击率',
      成本: '成本',
      CPC: '成本',
      素材: '素材',
      创意: '素材',
    },
    小红书: {
      花费: '花费',
      消耗: '花费',
      ROI: 'ROI',
      投资回报率: 'ROI',
      转化: '转化',
      转化数: '转化',
      点击率: '点击率',
      CTR: '点击率',
      成本: '成本',
      CPC: '成本',
      素材: '素材',
      创意: '素材',
    },
  }

  const mapping = FIELD_MAPPING[platform] || FIELD_MAPPING['抖音'] // 默认用抖音映射

  // 清洗数据：统一字段名
  const cleanedData = rawData.map((row) => {
    const cleaned = {}
    for (const [rawKey, standardKey] of Object.entries(mapping)) {
      // 尝试多种可能的字段名（大小写、空格等）
      const possibleKeys = [
        rawKey,
        rawKey.toLowerCase(),
        rawKey.toUpperCase(),
        rawKey.replace(/\s+/g, ''),
        rawKey.replace(/\s+/g, '_'),
      ]
      for (const key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== '') {
          cleaned[standardKey] = row[key]
          break
        }
      }
    }
    // 保留原始数据（用于调试）
    cleaned._raw = row
    return cleaned
  })

  // 提取关键指标文本
  const kpis = []
  cleanedData.forEach((row, idx) => {
    const kpiParts = []
    if (row.花费) kpiParts.push(`花费：${row.花费}`)
    if (row.ROI) kpiParts.push(`ROI：${row.ROI}`)
    if (row.转化) kpiParts.push(`转化：${row.转化}`)
    if (row.点击率) kpiParts.push(`点击率：${row.点击率}`)
    if (row.成本) kpiParts.push(`成本：${row.成本}`)
    if (row.素材) kpiParts.push(`素材：${row.素材}`)
    if (kpiParts.length > 0) {
      kpis.push(`第${idx + 1}条：${kpiParts.join('，')}`)
    }
  })

  const kpisText = kpis.length > 0 ? kpis.join('\n') : '（未提取到关键指标）'

  return {
    cleanedData,
    kpisText,
    summary: {
      totalRows: cleanedData.length,
      platforms: [platform],
      extractedFields: Object.keys(mapping).filter((k) => cleanedData.some((r) => r[mapping[k]])),
    },
  }
}

/**
 * 清洗直播流量数据
 * 
 * @param {Object} rawData - 原始流量数据（可能是 Excel Buffer 或 JSON）
 * @returns {Object} { cleanedData, trafficText }
 */
export function cleanTrafficData(rawData) {
  // 如果传入的是 Buffer，先解析 Excel
  let data = rawData
  if (Buffer.isBuffer(rawData)) {
    const workbook = XLSX.read(rawData, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    data = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  }

  // 标准化字段
  const cleaned = {
    场观: data.场观 || data.观看人数 || data.观看量 || '',
    来源: data.来源 || data.流量来源 || '',
    投流占比: data.投流占比 || data.付费流量占比 || '',
    自然占比: data.自然占比 || data.免费流量占比 || '',
    峰值人数: data.峰值人数 || data.最高在线 || '',
    平均停留: data.平均停留 || data.平均观看时长 || '',
  }

  // 生成文本描述
  const parts = []
  if (cleaned.场观) parts.push(`场观：${cleaned.场观}`)
  if (cleaned.来源) parts.push(`来源：${cleaned.来源}`)
  if (cleaned.投流占比) parts.push(`投流占比：${cleaned.投流占比}`)
  if (cleaned.自然占比) parts.push(`自然占比：${cleaned.自然占比}`)
  if (cleaned.峰值人数) parts.push(`峰值人数：${cleaned.峰值人数}`)
  if (cleaned.平均停留) parts.push(`平均停留：${cleaned.平均停留}`)

  const trafficText = parts.length > 0 ? parts.join('\n') : '（无流量数据）'

  return {
    cleanedData: cleaned,
    trafficText,
  }
}

/**
 * 清洗直播数据表现
 * 
 * @param {Object} rawData - 原始数据表现（可能是 Excel Buffer 或 JSON）
 * @returns {Object} { cleanedData, dataPerfText }
 */
export function cleanPerformanceData(rawData) {
  // 如果传入的是 Buffer，先解析 Excel
  let data = rawData
  if (Buffer.isBuffer(rawData)) {
    const workbook = XLSX.read(rawData, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    data = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  }

  // 标准化字段
  const cleaned = {
    GMV: data.GMV || data.成交金额 || data.销售额 || '',
    转化率: data.转化率 || data.转化 || '',
    点击率: data.点击率 || data.CTR || '',
    停留时长: data.停留时长 || data.平均停留 || '',
    SKU表现: data.SKU表现 || data.商品表现 || '',
  }

  // 生成文本描述
  const parts = []
  if (cleaned.GMV) parts.push(`GMV：${cleaned.GMV}`)
  if (cleaned.转化率) parts.push(`转化率：${cleaned.转化率}`)
  if (cleaned.点击率) parts.push(`点击率：${cleaned.点击率}`)
  if (cleaned.停留时长) parts.push(`停留时长：${cleaned.停留时长}`)
  if (cleaned.SKU表现) parts.push(`SKU表现：${cleaned.SKU表现}`)

  const dataPerfText = parts.length > 0 ? parts.join('\n') : '（无数据表现）'

  return {
    cleanedData: cleaned,
    dataPerfText,
  }
}

/**
 * 从字幕/记录中提取关键话术
 * 
 * @param {string} transcript - 字幕文本或记录文本
 * @returns {Object} { keyScripts, scriptText }
 */
export function extractKeyScripts(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      keyScripts: [],
      scriptText: '（无话术记录）',
    }
  }

  // 简单的关键词提取（可以后续用 AI 优化）
  const lines = transcript.split('\n').filter((line) => line.trim().length > 0)
  const keyScripts = []

  // 提取包含关键动作的句子
  const keywords = ['福利', '优惠', '限时', '抢购', '下单', '转化', '逼单', '异议', '解答', '卖点']
  lines.forEach((line, idx) => {
    if (keywords.some((kw) => line.includes(kw))) {
      keyScripts.push({
        index: idx + 1,
        text: line.trim(),
        type: keywords.find((kw) => line.includes(kw)),
      })
    }
  })

  // 如果没找到关键词，至少提取前 10 条
  if (keyScripts.length === 0 && lines.length > 0) {
    keyScripts.push(...lines.slice(0, 10).map((line, idx) => ({ index: idx + 1, text: line.trim(), type: '其他' })))
  }

  const scriptText = keyScripts.length > 0 ? keyScripts.map((s) => `${s.index}. ${s.text}`).join('\n') : '（无关键话术）'

  return {
    keyScripts,
    scriptText,
  }
}
