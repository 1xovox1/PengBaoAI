<template>
  <div class="ads-loop">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">投放闭环</h1>
        <p class="page-desc">上传/粘贴数据 → 生成日报（洞察 / 问题 / 行动）→ 行动回填，反哺下次策略</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="refreshAll">刷新</el-button>
      </div>
    </div>

    <div class="pipeline-bar">
      <div class="pipeline-step active">
        <span class="step-num">1</span>
        <span class="step-label">上传/输入数据</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step">
        <span class="step-num">2</span>
        <span class="step-label">生成日报</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step">
        <span class="step-num">3</span>
        <span class="step-label">查看建议</span>
      </div>
      <div class="pipeline-arrow" />
      <div class="pipeline-step">
        <span class="step-num">4</span>
        <span class="step-label">行动回填</span>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <span class="panel-title">新建投放复盘</span>
          </template>
          <el-form label-width="100px" class="compact-form">
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="例如：抖音投放日报 - 2/6" clearable />
            </el-form-item>
            <el-form-item label="平台">
              <el-select v-model="form.platform" style="width: 100%">
                <el-option label="抖音" value="抖音" />
                <el-option label="天猫" value="天猫" />
                <el-option label="京东" value="京东" />
                <el-option label="小红书" value="小红书" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="周期">
              <el-input v-model="form.period" placeholder="例如：2026-02-06 / 本周" clearable />
            </el-form-item>

            <el-form-item label="关键指标">
              <div class="input-actions">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".xlsx,.xls"
                  @change="onExcelChange"
                >
                  <el-button size="small" :loading="cleaning">上传 Excel 自动提取</el-button>
                </el-upload>
              </div>
              <el-input
                v-model="form.kpisText"
                type="textarea"
                :rows="5"
                placeholder="粘贴关键指标，或上传 Excel 自动提取：花费、ROI、转化、点击率、成本、素材表现…"
              />
            </el-form-item>

            <el-form-item label="补充上下文">
              <el-input
                v-model="form.contextText"
                type="textarea"
                :rows="4"
                placeholder="主推机型、活动政策、预算变化、素材更换、异常、目标…"
              />
            </el-form-item>

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
              <el-button type="primary" :loading="creating" size="large" @click="createAndGenerate">
                {{ creating ? '正在生成日报…' : '创建并生成日报' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <span class="panel-title">最近记录</span>
          </template>
          <div v-if="!runs.length" class="empty-state">
            <el-empty description="暂无投放复盘记录">
              <el-button type="primary" @click="refreshAll">刷新</el-button>
            </el-empty>
          </div>
          <el-table v-else :data="runs" stripe height="500" class="runs-table">
            <el-table-column prop="createdAt" label="时间" width="165" />
            <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
            <el-table-column prop="platform" label="平台" width="72" />
            <el-table-column label="状态" width="88">
              <template #default="{ row }">
                <el-tag v-if="row.report" type="success" size="small">已生成</el-tag>
                <el-tag v-else type="info" size="small">待生成</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openRun(row)">查看</el-button>
                <el-button link size="small" @click="regen(row)">重生成</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-drawer
      v-model="drawerOpen"
      size="min(580px, 96vw)"
      title="投放日报与回填"
      direction="rtl"
      class="detail-drawer"
    >
      <template v-if="activeRun" #header>
        <div class="drawer-header">
          <span class="drawer-title">{{ activeRun.title || '未命名' }}</span>
          <el-tag size="small" effect="plain">{{ activeRun.platform }}</el-tag>
          <el-tag size="small" effect="plain">{{ activeRun.period }}</el-tag>
        </div>
      </template>
      <div v-if="activeRun" class="drawer-body">
        <el-tabs v-model="detailTab" class="detail-tabs">
          <el-tab-pane label="日报" name="report">
            <div v-if="activeRun.report" class="structured-report">
              <template v-if="isReportStructured(activeRun.report)">
                <div v-if="activeRun.report.summary" class="block-item">
                  <div class="block-label">总结</div>
                  <div class="block-content">{{ activeRun.report.summary }}</div>
                </div>
                <div v-if="activeRun.report.insights?.length" class="block-item">
                  <div class="block-label">洞察</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.report.insights" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="activeRun.report.issues?.length" class="block-item">
                  <div class="block-label">问题</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.report.issues" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="reportActions.length" class="block-item">
                  <div class="block-label">行动建议（可一键加入回填）</div>
                  <div class="action-cards">
                    <div v-for="(a, i) in reportActions" :key="i" class="action-card">
                      <el-tag size="small" :type="a.priority === 'P0' ? 'danger' : a.priority === 'P1' ? 'warning' : 'info'">
                        {{ a.priority || 'P2' }}
                      </el-tag>
                      <span>{{ a.item }}</span>
                      <el-button link type="primary" size="small" @click="addBackfillFromReport(a)">加入回填</el-button>
                    </div>
                  </div>
                </div>
                <div v-if="activeRun.report.risks?.length" class="block-item">
                  <div class="block-label">风险</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.report.risks" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="activeRun.report.questions?.length" class="block-item">
                  <div class="block-label">待确认</div>
                  <ul class="block-list">
                    <li v-for="(item, i) in activeRun.report.questions" :key="i">{{ item }}</li>
                  </ul>
                </div>
                <el-button text size="small" @click="copyJson(activeRun.report)">复制全文 JSON</el-button>
              </template>
              <template v-else>
                <pre class="json-pre">{{ formatReport(activeRun.report) }}</pre>
                <el-button text size="small" @click="copyJson(activeRun.report)">复制</el-button>
              </template>
            </div>
            <div v-else class="empty-in-drawer">
              <p class="muted">暂无日报，请点击「重生成」</p>
              <el-button type="primary" size="small" @click="regen(activeRun)">生成日报</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="行动回填" name="backfill">
            <el-form label-width="80px" size="small">
              <el-form-item label="动作">
                <el-input v-model="backfill.item" placeholder="例如：P0 调整人群包，降低泛人群预算" clearable />
              </el-form-item>
              <el-form-item label="负责人">
                <el-select v-model="backfill.owner" style="width: 100%">
                  <el-option label="投放" value="投放" />
                  <el-option label="运营" value="运营" />
                  <el-option label="设计" value="设计" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item label="结果/备注">
                <el-input v-model="backfill.result" type="textarea" :rows="3" placeholder="例如：已执行，ROI +0.2，成本降 8%" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingBackfill" @click="saveBackfill">保存回填</el-button>
              </el-form-item>
            </el-form>
            <div class="backfill-history">
              <div class="block-label">历史回填</div>
              <el-table :data="activeRun.actionBackfill || []" size="small" max-height="260">
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
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { listAdsRuns, createAdsRun, generateAdsRun, backfillAdsRun, cleanAdsDataFile } from '@/api/ads'

const runs = ref([])
const creating = ref(false)
const cleaning = ref(false)
const savingBackfill = ref(false)
const drawerOpen = ref(false)
const activeRun = ref(null)
const detailTab = ref('report')

const form = ref({
  title: '',
  platform: '抖音',
  period: '',
  kpisText: '',
  contextText: '',
  model: 'dify',
})

const backfill = ref({ item: '', owner: '投放', result: '' })

const reportActions = computed(() => {
  const r = activeRun.value?.report
  if (!r || typeof r !== 'object') return []
  const list = r.actions || r.next_actions
  return Array.isArray(list) ? list : []
})

async function refreshAll() {
  runs.value = await listAdsRuns()
}

onMounted(() => { refreshAll().catch(() => {}) })

async function onExcelChange({ raw: file }) {
  if (!file) return
  cleaning.value = true
  try {
    const data = await cleanAdsDataFile(file, form.value.platform)
    form.value.kpisText = data.kpisText || form.value.kpisText
    ElMessage.success(`已提取 ${data.summary?.totalRows || 0} 行关键指标`)
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '解析失败，请检查 Excel 格式')
  } finally {
    cleaning.value = false
  }
}

async function createAndGenerate() {
  if (!form.value.title?.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  creating.value = true
  try {
    const run = await createAdsRun(form.value)
    const updated = await generateAdsRun(run.id, { model: form.value.model })
    ElMessage.success('日报已生成')
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
  detailTab.value = 'report'
  drawerOpen.value = true
}

async function regen(run) {
  try {
    const updated = await generateAdsRun(run.id, { model: form.value.model })
    ElMessage.success('已重生成')
    await refreshAll()
    if (activeRun.value?.id === run.id) activeRun.value = updated
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '重生成失败')
  }
}

function isReportStructured(report) {
  return report && typeof report === 'object' && !report.raw && (report.summary || report.insights || report.actions)
}

function formatReport(r) {
  try {
    return JSON.stringify(r, null, 2)
  } catch {
    return String(r)
  }
}

function addBackfillFromReport(a) {
  backfill.value.item = typeof a === 'object' ? (a.item || a) : String(a)
  backfill.value.owner = (a && a.owner) || '投放'
  detailTab.value = 'backfill'
  ElMessage.success('已填入回填表单，请补充结果后保存')
}

function copyJson(obj) {
  const text = typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj)
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制')).catch(() => ElMessage.error('复制失败'))
}

async function saveBackfill() {
  if (!activeRun.value?.id) return
  if (!backfill.value.item.trim()) {
    ElMessage.warning('请填写动作描述')
    return
  }
  savingBackfill.value = true
  try {
    const updated = await backfillAdsRun(activeRun.value.id, [backfill.value])
    activeRun.value = updated
    backfill.value = { item: '', owner: '投放', result: '' }
    ElMessage.success('已保存回填')
    await refreshAll()
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '保存失败')
  } finally {
    savingBackfill.value = false
  }
}
</script>

<style scoped lang="scss">
.ads-loop { padding: 20px 24px 32px; }
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
  margin-bottom: 20px;
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

.panel-card { border-radius: 12px; border: 1px solid #e5e7eb; }
.panel-title { font-weight: 600; color: #111827; }
.compact-form :deep(.el-form-item) { margin-bottom: 14px; }
.input-actions { margin-bottom: 6px; }
.empty-state { padding: 24px 0; }
.runs-table { font-size: 13px; }

.detail-drawer .drawer-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.drawer-title { font-weight: 600; margin-right: 8px; }
.drawer-body { padding: 0 4px; }
.detail-tabs { margin-top: -8px; }
.structured-report .block-item { margin-bottom: 16px; }
.block-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
.block-content { font-size: 13px; line-height: 1.6; }
.block-list { margin: 0; padding-left: 18px; }
.action-cards { display: flex; flex-direction: column; gap: 8px; }
.action-card { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px; background: #f9fafb; border-radius: 8px; font-size: 13px; }
.json-pre { margin: 0; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 360px; white-space: pre-wrap; }
.empty-in-drawer { padding: 20px 0; text-align: center; }
.backfill-history { margin-top: 16px; }
.muted { color: #6b7280; font-size: 13px; }
</style>
