/**
 * Agent 编排服务
 * 作用：组合多个 Agent 的调用，实现复杂的业务流程
 * 
 * 使用场景：
 * 1. 直播前生成：场景 Agent → 历史 Agent → 故事化 Agent
 * 2. 投放日报：投放日报 Agent（单一 Agent）
 * 3. 直播复盘：复盘 Agent（单一 Agent，但可以扩展为多 Agent）
 */

import nodeFetch from 'node-fetch'
const _fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : nodeFetch

/**
 * 调用单个 Dify Agent
 * @param {Object} options
 * @param {string} options.baseURL - Dify Base URL
 * @param {string} options.apiKey - Dify API Key
 * @param {string} options.query - 用户输入
 * @param {Object} options.inputs - Dify 变量（可选）
 * @param {number} options.timeout - 超时时间（毫秒，默认 120000）
 * @returns {Promise<string>} Agent 返回的内容
 */
async function callDifyAgent({ baseURL, apiKey, query, inputs = {}, timeout = 120000 }) {
  const url = `${baseURL.replace(/\/$/, '')}/v1/chat-messages`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await _fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        user: 'pengbao-orchestrator',
        inputs,
        response_mode: 'blocking',
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Dify Agent 请求失败 (${res.status}): ${errText}`)
    }

    const data = await res.json()
    const answer = data.answer
    if (!answer) {
      throw new Error('Dify Agent 返回无 answer 字段')
    }
    return answer
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      throw new Error('Dify Agent 请求超时')
    }
    throw e
  }
}

/**
 * 获取 Agent 配置
 * @param {string} agentKey - Agent 标识（例如：'live-scenario', 'live-history', 'live-story', 'ads-report'）
 * @returns {Object} { baseURL, apiKey }
 */
function getAgentConfig(agentKey) {
  const baseURL = process.env.DIFY_BASE_URL
  if (!baseURL) {
    throw new Error('未配置 DIFY_BASE_URL')
  }

  // Agent Key 到环境变量的映射
  const AGENT_KEY_MAP = {
    // 直播相关
    'live-scenario': 'DIFY_API_KEY_LIVE_SCENARIO', // 产品应用场景 Agent
    'live-history': 'DIFY_API_KEY_LIVE_HISTORY', // 产品历史背景 Agent
    'live-story': 'DIFY_API_KEY_LIVE_STORY', // 专业故事化 Agent
    'live-review': 'DIFY_API_KEY_LIVE_REVIEW', // 直播复盘 Agent

    // 投放相关
    'ads-report': 'DIFY_API_KEY_ADS_REPORT', // 投放日报 Agent

    // 默认（兼容旧代码）
    'default': 'DIFY_API_KEY',
  }

  const envKey = AGENT_KEY_MAP[agentKey] || AGENT_KEY_MAP['default']
  const apiKey = process.env[envKey]

  if (!apiKey) {
    throw new Error(`未配置 ${envKey}。请在 server/.env 中设置该环境变量`)
  }

  return { baseURL, apiKey }
}

/**
 * 直播前生成：多 Agent 组合调用
 * 
 * 流程：
 * 1. 调用"产品应用场景 Agent" → 生成应用场景话术模块
 * 2. 调用"产品历史背景 Agent" → 生成历史故事模块
 * 3. 调用"专业故事化 Agent"（输入：Step1 + Step2 的输出）→ 生成完整播前话术 JSON
 * 
 * @param {Object} inputs
 * @param {string} inputs.title - 直播标题
 * @param {string} inputs.platform - 平台（抖音/天猫）
 * @param {string} inputs.period - 场次/周期
 * @param {string} inputs.policyPrice - 政策/价格
 * @param {string} inputs.goods - 货盘/主推商品
 * @param {string} inputs.trafficExpect - 流量预期
 * @param {string} inputs.anchorState - 主播状态/人设
 * @param {string} inputs.goal - 目标
 * @returns {Promise<Object>} { scenarioOutput, historyOutput, finalOutput, steps }
 */
export async function orchestrateLivePre(inputs) {
  const steps = []
  let scenarioOutput = ''
  let historyOutput = ''
  let finalOutput = ''

  try {
    // Step 1: 产品应用场景 Agent
    steps.push({ name: '产品应用场景 Agent', status: 'running' })
    const scenarioConfig = getAgentConfig('live-scenario')
    const scenarioPrompt = `请为以下直播生成"产品应用场景话术模块"：

直播信息：
- 标题：${inputs.title || '未填'}
- 平台：${inputs.platform || '未填'}
- 场次：${inputs.period || '未填'}
- 目标：${inputs.goal || '未填'}

政策/价格：
${inputs.policyPrice || '(无)'}

货盘/主推商品：
${inputs.goods || '(无)'}

流量预期：
${inputs.trafficExpect || '(无)'}

主播状态/人设：
${inputs.anchorState || '(无)'}

请输出 JSON 格式的应用场景话术模块（包含场景、痛点、卖点、引导等）。`

    scenarioOutput = await callDifyAgent({
      baseURL: scenarioConfig.baseURL,
      apiKey: scenarioConfig.apiKey,
      query: scenarioPrompt,
    })
    steps[steps.length - 1] = { name: '产品应用场景 Agent', status: 'completed', output: scenarioOutput }

    // Step 2: 产品历史背景 Agent
    steps.push({ name: '产品历史背景 Agent', status: 'running' })
    const historyConfig = getAgentConfig('live-history')
    const historyPrompt = `请为以下产品生成"历史背景故事模块"：

产品信息（从货盘中提取）：
${inputs.goods || '(无)'}

请输出 JSON 格式的历史背景故事模块（包含产品系列、代际、技术演进、用户故事等）。`

    historyOutput = await callDifyAgent({
      baseURL: historyConfig.baseURL,
      apiKey: historyConfig.apiKey,
      query: historyPrompt,
    })
    steps[steps.length - 1] = { name: '产品历史背景 Agent', status: 'completed', output: historyOutput }

    // Step 3: 专业故事化 Agent（组合 Step1 + Step2）
    steps.push({ name: '专业故事化 Agent', status: 'running' })
    const storyConfig = getAgentConfig('live-story')
    const storyPrompt = `请基于以下两个模块，生成"完整的播前话术 JSON"：

【应用场景话术模块】
${scenarioOutput}

【历史背景故事模块】
${historyOutput}

直播信息：
- 标题：${inputs.title || '未填'}
- 平台：${inputs.platform || '未填'}
- 场次：${inputs.period || '未填'}
- 目标：${inputs.goal || '未填'}

请输出完整的 JSON 格式播前话术（包含：summary、modules.opening、modules.handoff、modules.goods、modules.benefits、modules.closing、modules.objections、modules.control、variables）。`

    finalOutput = await callDifyAgent({
      baseURL: storyConfig.baseURL,
      apiKey: storyConfig.apiKey,
      query: storyPrompt,
    })
    steps[steps.length - 1] = { name: '专业故事化 Agent', status: 'completed', output: finalOutput }

    return {
      scenarioOutput,
      historyOutput,
      finalOutput,
      steps,
    }
  } catch (e) {
    // 标记失败的步骤
    const failedStep = steps.find((s) => s.status === 'running')
    if (failedStep) {
      failedStep.status = 'failed'
      failedStep.error = e.message
    }
    throw e
  }
}

/**
 * 投放日报生成：单一 Agent 调用
 * 
 * @param {Object} inputs
 * @param {string} inputs.platform - 平台
 * @param {string} inputs.period - 周期
 * @param {string} inputs.kpisText - 关键指标文本
 * @param {string} inputs.contextText - 补充上下文
 * @returns {Promise<string>} 生成的日报内容
 */
export async function orchestrateAdsReport(inputs) {
  const config = getAgentConfig('ads-report')
  const prompt = `你是资深投放分析师。请基于我提供的信息输出"日报/周报复盘"结构化结果，必须包含：insights、issues、actions、risks、questions。

要求：
- 用中文
- insights/issues/actions 每项 3-8 条，尽量具体可执行
- actions 必须是"明日/本周可执行动作清单"，包含优先级（P0/P1/P2）与负责人建议（如：投放/设计/运营）
- 输出必须是 JSON（不要用 Markdown 包裹）

背景：
- 平台：${inputs.platform || '未指定'}
- 周期：${inputs.period || '未指定'}

关键数据（可能不完整）：
${inputs.kpisText || '(无)'}

补充上下文：
${inputs.contextText || '(无)'}

请输出 JSON：
{
  "insights": ["..."],
  "issues": ["..."],
  "actions": [{"priority":"P0","owner":"投放","item":"..."}],
  "risks": ["..."],
  "questions": ["..."],
  "summary": "一段话总结"
}`

  return await callDifyAgent({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    query: prompt,
  })
}

/**
 * 直播复盘生成：单一 Agent 调用（可扩展为多 Agent）
 * 
 * @param {Object} inputs
 * @param {string} inputs.title - 直播标题
 * @param {string} inputs.platform - 平台
 * @param {string} inputs.period - 场次/周期
 * @param {string} inputs.policyPrice - 政策价格
 * @param {string} inputs.traffic - 流量数据
 * @param {string} inputs.dataPerf - 数据表现
 * @param {string} inputs.anchorScript - 主播状态与话术
 * @param {string} inputs.extra - 补充信息
 * @returns {Promise<string>} 生成的复盘内容
 */
export async function orchestrateLiveReview(inputs) {
  const config = getAgentConfig('live-review')
  const prompt = `你是资深直播复盘专家。请基于四因素（政策价格/流量/数据/主播状态与话术）做复盘，并输出"下次可执行改动清单"。

要求：
- 用中文
- 输出必须是 JSON
- 结论要可执行：哪些话术模块保留/删减/改写；哪些策略动作下次要做

直播信息：
- 标题：${inputs.title || '未填'}
- 平台：${inputs.platform || '未填'}
- 场次/周期：${inputs.period || '未填'}

1) 政策价格：
${inputs.policyPrice || '(无)'}

2) 流量：
${inputs.traffic || '(无)'}

3) 数据表现：
${inputs.dataPerf || '(无)'}

4) 主播状态与话术：
${inputs.anchorScript || '(无)'}

补充：
${inputs.extra || '(无)'}

请输出 JSON：
{
  "summary": "一句话复盘",
  "insights": ["..."],
  "issues": ["..."],
  "next_actions": [{"priority":"P0","owner":"运营","item":"..."}],
  "script_changes": {
    "keep": ["保留模块..."],
    "remove": ["删减模块..."],
    "rewrite": [{"module":"...","suggestion":"..."}]
  },
  "questions": ["下次需要补充的数据/问题..."],
  "pre_prompt_for_next": "给播前生成的提示词（可直接粘贴）"
}`

  return await callDifyAgent({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    query: prompt,
  })
}
