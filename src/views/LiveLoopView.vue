<template>
  <div class="live-loop">
    <!-- 顶部：闭环流程可视化 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">直播话术闭环</h1>
        <p class="page-desc">播前生成话术 → 播后四因素复盘 → 行动回填 → 反哺下一场</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="refreshAll">刷新</el-button>
      </div>
    </div>

    <div class="pipeline-bar">
      <div class="pipeline-step" :class="{ active: stage === 'pre' }">
        <span class="step-num">1</span>
        <span class="step-label">播前准备</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step" :class="{ active: stage === 'post' }">
        <span class="step-num">2</span>
        <span class="step-label">创建场次</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step">
        <span class="step-num">3</span>
        <span class="step-label">播后复盘</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step">
        <span class="step-num">4</span>
        <span class="step-label">行动回填</span>
      </div>
    </div>

    <el-tabs v-model="stage" class="stage-tabs">
      <el-tab-pane label="直播前" name="pre" />
      <el-tab-pane label="直播中（规划中）" name="mid" />
      <el-tab-pane label="直播后" name="post" />
    </el-tabs>

    <!-- 直播后：新建场次 + 最近记录 -->
    <template v-if="stage === 'post'">
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="panel-card">
            <template #header>
              <span class="panel-title">新建场次</span>
            </template>
            <el-form label-width="100px" class="compact-form">
              <el-form-item label="标题">
                <el-input v-model="form.title" placeholder="例如：三星S系列 直播间 - 晚场" clearable />
              </el-form-item>
              <el-form-item label="平台">
                <el-select v-model="form.platform" style="width: 100%">
                  <el-option label="抖音" value="抖音" />
                  <el-option label="天猫" value="天猫" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item label="场次/周期">
                <el-input v-model="form.period" placeholder="例如：2026-02-06 晚场" clearable />
              </el-form-item>
              <el-form-item label="目标">
                <el-input v-model="form.goal" placeholder="例如：冲 GMV / 新品教育 / 清库存" clearable />
              </el-form-item>
              <el-collapse>
                <el-collapse-item title="政策 / 货盘 / 流量 / 主播（点击展开）" name="detail">
                  <el-form-item label="政策/价格">
                    <el-input v-model="form.policyPrice" type="textarea" :rows="2" placeholder="国补、到手价、优惠节奏…" />
                  </el-form-item>
                  <el-form-item label="货盘/主推">
                    <el-input v-model="form.goods" type="textarea" :rows="2" placeholder="主推 SKU、卖点、库存…" />
                  </el-form-item>
                  <el-form-item label="流量预期">
                    <el-input v-model="form.trafficExpect" type="textarea" :rows="2" placeholder="投流/自然占比、峰值预期…" />
                  </el-form-item>
                  <el-form-item label="主播状态">
                    <el-input v-model="form.anchorState" type="textarea" :rows="2" placeholder="人设、强项、限制…" />
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
              <el-form-item label="生成模型">
                <el-select v-model="form.model" style="width: 100%">
                  <el-option label="Dify（推荐）" value="dify" />
                  <el-option label="GPT" value="gpt-4" />
                  <el-option label="Kimi" value="kimi" />
                  <el-option label="DeepSeek" value="deepseek" />
                  <el-option label="Claude" value="claude-3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="creating" size="large" @click="createAndGeneratePre">
                  {{ creating ? '正在生成…' : '创建并生成播前话术' }}
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="panel-card">
            <template #header>
              <span class="panel-title">最近场次</span>
            </template>
            <!-- 空状态 -->
            <div v-if="!runs.length" class="empty-state">
              <el-empty description="暂无场次记录">
                <el-button type="primary" @click="stage = 'post'">去创建第一场</el-button>
              </el-empty>
            </div>
            <el-table v-else :data="runs" stripe height="520" class="runs-table">
              <el-table-column prop="createdAt" label="时间" width="165" />
              <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
              <el-table-column prop="platform" label="平台" width="72" />
              <el-table-column label="状态" width="88">
                <template #default="{ row }">
                  <el-tag v-if="row.pre" type="success" size="small">有话术</el-tag>
                  <el-tag v-else type="info" size="small">待生成</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openRun(row)">查看</el-button>
                  <el-button link size="small" @click="regenPre(row)">重生成</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 直播前：工具卡片 -->
    <div v-if="stage === 'pre'" class="helper-section">
      <h3 class="section-heading">播前助手</h3>
      <p class="section-desc">按需使用场景话术、历史背景、故事化等工具，或直接在「直播后」创建场次一键生成。</p>
      <el-row :gutter="16" class="helper-grid">
        <el-col :xs="24" :sm="8">
          <el-card
            shadow="hover"
            class="helper-card"
            :class="{ active: selectedTool === 'scenario' }"
            @click="openTool('scenario')"
          >
            <div class="helper-icon">📋</div>
            <div class="helper-name">产品应用场景</div>
            <div class="helper-desc">点选+填空拼 Prompt，一键生成主播可用话术。</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card
            shadow="hover"
            class="helper-card"
            :class="{ active: selectedTool === 'history' }"
            @click="openTool('history')"
          >
            <div class="helper-icon">📜</div>
            <div class="helper-name">产品历史背景（预留）</div>
            <div class="helper-desc">品牌/系列历史、技术演进故事化内容。</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card
            shadow="hover"
            class="helper-card"
            :class="{ active: selectedTool === 'story' }"
            @click="openTool('story')"
          >
            <div class="helper-icon">🎬</div>
            <div class="helper-name">专业故事化（预留）</div>
            <div class="helper-desc">整合场景+历史为完整故事脚本。</div>
          </el-card>
        </el-col>
      </el-row>
      <ProductScenarioTool v-if="selectedTool === 'scenario'" class="tool-detail" />
      <el-card v-else-if="selectedTool === 'history'" shadow="never" class="tool-detail card-placeholder">
        <p class="muted">后续挂载「品牌/系列历史、代际演进」生成工具。</p>
      </el-card>
      <el-card v-else-if="selectedTool === 'story'" shadow="never" class="tool-detail card-placeholder">
        <p class="muted">后续挂载「场景+历史整合为完整故事脚本」助手。</p>
      </el-card>
    </div>

    <!-- 直播中占位 -->
    <div v-else-if="stage === 'mid'" class="stage-placeholder">
      <el-card shadow="never" class="panel-card">
        <el-empty description="直播中助手（规划中）">
          <p class="muted">播中实时辅助、异议建议、节奏提醒等，待播前/播后闭环稳定后扩展。</p>
        </el-empty>
      </el-card>
    </div>

    <!-- 详情抽屉：Tab 播前话术 | 播后复盘 | 行动回填 -->
    <el-drawer
      v-model="drawerOpen"
      size="min(620px, 96vw)"
      title="场次详情"
      direction="rtl"
      class="detail-drawer"
    >
      <template v-if="activeRun" #header>
        <div class="drawer-header">
          <span class="drawer-title">{{ activeRun.title || '未命名场次' }}</span>
          <el-tag size="small" effect="plain">{{ activeRun.platform }}</el-tag>
          <el-tag size="small" effect="plain">{{ activeRun.period }}</el-tag>
        </div>
      </template>
      <div v-if="activeRun" class="drawer-body">
        <el-tabs v-model="detailTab" class="detail-tabs">
          <el-tab-pane label="播前话术" name="pre">
            <div v-if="activeRun.pre" class="structured-block">
              <template v-if="isPreStructured(activeRun.pre)">
                <div class="block-item">
                  <div class="block-label">策略摘要</div>
                  <div class="block-content">{{ activeRun.pre.summary || '—' }}</div>
                </div>
                <div v-if="activeRun.pre.modules" class="block-item">
                  <div class="block-label">模块话术</div>
                  <div class="block-content modules">
                    <div v-for="(v, k) in activeRun.pre.modules" :key="k" class="module-row">
                      <strong>{{ moduleLabel(k) }}</strong>
                      <pre class="module-pre">{{ typeof v === 'object' ? JSON.stringify(v, null, 2) : v }}</pre>
                    </div>
                  </div>
                </div>
                <el-button text size="small" @click="copyJson(activeRun.pre)">复制全文 JSON</el-button>
              </template>
              <template v-else>
                <pre class="json-pre">{{ format(activeRun.pre) }}</pre>
                <el-button text size="small" @click="copyJson(activeRun.pre)">复制</el-button>
              </template>
            </div>
            <div v-else class="empty-in-drawer">
              <p class="muted">暂无播前话术</p>
              <el-button type="primary" size="small" :loading="regenLoading" @click="regenPre(activeRun)">生成话术</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="播后复盘" name="review">
            <div class="review-inputs">
              <el-form label-width="90px" size="small">
                <el-form-item label="流量">
                  <el-input v-model="reviewInput.traffic" type="textarea" :rows="2" placeholder="场观、来源、投流/自然占比…" />
                </el-form-item>
                <el-form-item label="数据表现">
                  <el-input v-model="reviewInput.dataPerf" type="textarea" :rows="2" placeholder="GMV、转化、停留、SKU 表现…" />
                </el-form-item>
                <el-form-item label="主播&话术">
                  <el-input v-model="reviewInput.anchorScript" type="textarea" :rows="2" placeholder="话术版本、关键异议、主播状态…" />
                </el-form-item>
                <el-form-item label="补充">
                  <el-input v-model="reviewInput.extra" type="textarea" :rows="2" placeholder="异常、活动变化…" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="reviewing" @click="generateReviewNow">
                    {{ reviewing ? '正在生成复盘…' : '生成复盘' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            <div v-if="activeRun.review" class="structured-block">
              <template v-if="isReviewStructured(activeRun.review)">
                <div class="block-item">
                  <div class="block-label">复盘摘要</div>
                  <div class="block-content">{{ activeRun.review.summary || '—' }}</div>
                </div>
                <div v-if="activeRun.review.insights?.length" class="block-item">
                  <div class="block-label">洞察</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.review.insights" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="activeRun.review.issues?.length" class="block-item">
                  <div class="block-label">问题</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.review.issues" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="activeRun.review.next_actions?.length" class="block-item">
                  <div class="block-label">下次行动建议</div>
                  <div class="action-cards">
                    <div v-for="(a, i) in activeRun.review.next_actions" :key="i" class="action-card">
                      <el-tag size="small" type="danger">{{ a.priority || 'P0' }}</el-tag>
                      <span>{{ a.item }}</span>
                      <el-button link type="primary" size="small" @click="addBackfillFromReview(a)">加入回填</el-button>
                    </div>
                  </div>
                </div>
                <el-button text size="small" @click="copyJson(activeRun.review)">复制全文 JSON</el-button>
              </template>
              <template v-else>
                <pre class="json-pre">{{ format(activeRun.review) }}</pre>
                <el-button text size="small" @click="copyJson(activeRun.review)">复制</el-button>
              </template>
            </div>
            <div v-else class="empty-in-drawer">
              <p class="muted">填写上方数据后点击「生成复盘」</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="行动回填" name="backfill">
            <el-form label-width="80px" size="small">
              <el-form-item label="动作">
                <el-input v-model="backfill.item" placeholder="例如：下次开场福利提前 2 分钟" clearable />
              </el-form-item>
              <el-form-item label="负责人">
                <el-select v-model="backfill.owner" style="width: 100%">
                  <el-option label="运营" value="运营" />
                  <el-option label="主播" value="主播" />
                  <el-option label="投放" value="投放" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item label="结果/备注">
                <el-input v-model="backfill.result" type="textarea" :rows="2" placeholder="执行结果或未执行原因" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingBackfill" @click="saveBackfill">保存回填</el-button>
              </el-form-item>
            </el-form>
            <div class="backfill-history">
              <div class="block-label">历史回填</div>
              <el-table :data="activeRun.actionBackfill || []" size="small" max-height="280">
                <el-table-column prop="time" label="时间" width="165" />
                <el-table-column prop="owner" label="负责人" width="72" />
                <el-table-column prop="item" label="动作" min-width="120" show-overflow-tooltip />
                <el-table-column prop="result" label="结果" min-width="100" show-overflow-tooltip />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { listLiveRuns, createLiveRun, generatePre, generateReview, backfillLiveRun } from '@/api/live'
import ProductScenarioTool from '@/components/live/ProductScenarioTool.vue'

const runs = ref([])
const stage = ref('pre')
const selectedTool = ref('')
const creating = ref(false)
const reviewing = ref(false)
const regenLoading = ref(false)
const savingBackfill = ref(false)
const drawerOpen = ref(false)
const activeRun = ref(null)
const detailTab = ref('pre')

const form = ref({
  title: '',
  platform: '抖音',
  period: '',
  goal: '',
  policyPrice: '',
  goods: '',
  trafficExpect: '',
  anchorState: '',
  model: 'dify',
})

const reviewInput = ref({ traffic: '', dataPerf: '', anchorScript: '', extra: '' })
const backfill = ref({ item: '', owner: '运营', result: '' })

async function refreshAll() {
  runs.value = await listLiveRuns()
}

onMounted(() => { refreshAll().catch(() => {}) })

function openTool(key) {
  selectedTool.value = key
}

async function createAndGeneratePre() {
  if (!form.value.title?.trim()) {
    ElMessage.warning('请填写场次标题')
    return
  }
  creating.value = true
  try {
    const run = await createLiveRun(form.value)
    const updated = await generatePre(run.id, { model: form.value.model })
    ElMessage.success('播前话术已生成')
    await refreshAll()
    openRun(updated)
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '生成失败')
  } finally {
    creating.value = false
  }
}

function openRun(run) {
  activeRun.value = run
  reviewInput.value = {
    traffic: run.traffic || '',
    dataPerf: run.dataPerf || '',
    anchorScript: run.anchorScript || '',
    extra: run.extra || '',
  }
  detailTab.value = 'pre'
  drawerOpen.value = true
}

watch(activeRun, (r) => {
  if (r) {
    reviewInput.value = {
      traffic: r.traffic || '',
      dataPerf: r.dataPerf || '',
      anchorScript: r.anchorScript || '',
      extra: r.extra || '',
    }
  }
}, { immediate: true })

async function regenPre(run) {
  regenLoading.value = true
  try {
    const updated = await generatePre(run.id, { model: form.value.model })
    ElMessage.success('已重生成')
    await refreshAll()
    if (activeRun.value?.id === run.id) activeRun.value = updated
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '重生成失败')
  } finally {
    regenLoading.value = false
  }
}

async function generateReviewNow() {
  if (!activeRun.value?.id) return
  reviewing.value = true
  try {
    const payload = {
      model: form.value.model,
      traffic: reviewInput.value.traffic,
      dataPerf: reviewInput.value.dataPerf,
      anchorScript: reviewInput.value.anchorScript,
      extra: reviewInput.value.extra,
    }
    const updated = await generateReview(activeRun.value.id, payload)
    activeRun.value = updated
    ElMessage.success('复盘已生成')
    await refreshAll()
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '复盘失败')
  } finally {
    reviewing.value = false
  }
}

function addBackfillFromReview(a) {
  backfill.value.item = typeof a === 'object' ? (a.item || a) : String(a)
  backfill.value.owner = (a && a.owner) || '运营'
  detailTab.value = 'backfill'
  ElMessage.success('已填入回填表单，请补充结果后保存')
}

function saveBackfill() {
  if (!activeRun.value?.id) return
  if (!backfill.value.item.trim()) {
    ElMessage.warning('请填写动作')
    return
  }
  savingBackfill.value = true
  backfillLiveRun(activeRun.value.id, [backfill.value])
    .then((updated) => {
      activeRun.value = updated
      backfill.value = { item: '', owner: '运营', result: '' }
      ElMessage.success('已保存回填')
      return refreshAll()
    })
    .catch((e) => ElMessage.error(e?.response?.data?.error || e?.message || '保存失败'))
    .finally(() => { savingBackfill.value = false })
}

function format(r) {
  try {
    return JSON.stringify(r, null, 2)
  } catch {
    return String(r)
  }
}

function isPreStructured(pre) {
  return pre && typeof pre === 'object' && !pre.raw && (pre.summary || pre.modules)
}

function isReviewStructured(review) {
  return review && typeof review === 'object' && !review.raw && (review.summary || review.insights || review.next_actions)
}

function moduleLabel(k) {
  const map = { opening: '开场', handoff: '承接', goods: '卖点', benefits: '福利', closing: '逼单', objections: '异议处理', control: '场控' }
  return map[k] || k
}

function copyJson(obj) {
  const text = typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj)
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制到剪贴板')).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped lang="scss">
.live-loop { padding: 20px 24px 32px; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title { margin: 0; font-size: 24px; font-weight: 700; color: #111827; }
.page-desc { margin: 6px 0 0; font-size: 13px; color: #6b7280; }
.header-actions { flex-shrink: 0; }

.pipeline-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pipeline-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  color: #6b7280;
  font-size: 13px;
  .step-num {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    background: #e5e7eb;
    border-radius: 50%;
    font-weight: 600;
  }
  &.active {
    color: #111827;
    background: #eff6ff;
    .step-num { background: #2563eb; color: #fff; }
  }
}
.pipeline-arrow { width: 16px; height: 2px; background: #d1d5db; }

.stage-tabs { margin-bottom: 16px; }
.panel-card { border-radius: 12px; border: 1px solid #e5e7eb; }
.panel-title { font-weight: 600; color: #111827; }
.compact-form :deep(.el-form-item) { margin-bottom: 14px; }
.empty-state { padding: 24px 0; }
.runs-table { font-size: 13px; }

.helper-section { margin-top: 8px; }
.section-heading { margin: 0 0 4px; font-size: 16px; color: #111827; }
.section-desc { margin: 0 0 16px; font-size: 13px; color: #6b7280; }
.helper-grid { margin-bottom: 16px; }
.helper-card {
  cursor: pointer;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
  border: 2px solid #e5e7eb;
  .helper-icon { font-size: 24px; margin-bottom: 8px; }
  .helper-name { font-weight: 600; color: #111827; margin-bottom: 4px; }
  .helper-desc { font-size: 12px; color: #6b7280; }
  &.active { border-color: #2563eb; background: #eff6ff; }
}
.tool-detail { margin-top: 16px; }
.card-placeholder { padding: 20px; }
.muted { color: #6b7280; font-size: 13px; }
.stage-placeholder { margin-top: 16px; }

.detail-drawer .drawer-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.drawer-title { font-weight: 600; margin-right: 8px; }
.drawer-body { padding: 0 4px; }
.detail-tabs { margin-top: -8px; }
.structured-block { margin-top: 12px; }
.block-item { margin-bottom: 16px; }
.block-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
.block-content { font-size: 13px; line-height: 1.6; }
.block-list { margin: 0; padding-left: 18px; }
.modules .module-row { margin-bottom: 12px; }
.module-pre { margin: 4px 0 0; padding: 8px; background: #f3f4f6; border-radius: 6px; font-size: 12px; white-space: pre-wrap; max-height: 200px; overflow: auto; }
.action-cards { display: flex; flex-direction: column; gap: 8px; }
.action-card { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px; background: #f9fafb; border-radius: 8px; font-size: 13px; }
.json-pre { margin: 0; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 360px; white-space: pre-wrap; }
.empty-in-drawer { padding: 20px 0; text-align: center; }
.review-inputs { margin-bottom: 16px; }
.backfill-history { margin-top: 16px; }
</style>
