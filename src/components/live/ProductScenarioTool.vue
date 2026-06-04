<template>
  <el-card shadow="never" class="scenario-card">
    <template #header>
      <div class="card-header">
        <div>
          <div class="title">产品应用场景话术制作</div>
          <div class="subtitle">通过点选+填空快速组合提示词，一键生成主播可用的话术</div>
        </div>
        <el-button :loading="generating" type="primary" @click="generateScript">生成话术</el-button>
      </div>
    </template>

    <div class="scenario-layout">
      <!-- 左侧：基础信息 -->
      <div class="left">
        <h4 class="section-title">基础信息</h4>
        <el-form label-width="80px" size="small">
          <el-form-item label="直播方式">
            <el-select v-model="form.liveMode" placeholder="选择方式">
              <el-option label="单人话术" value="单人话术" />
              <el-option label="双人对话" value="双人对话" />
              <el-option label="访谈/连麦" value="访谈/连麦" />
            </el-select>
          </el-form-item>
          <el-form-item label="产品名称">
            <el-input v-model="form.productName" placeholder="例如：Galaxy S25" />
          </el-form-item>
          <el-form-item label="产品系列">
            <el-input v-model="form.productSeries" placeholder="例如：Galaxy S 系列" />
          </el-form-item>
        </el-form>

        <el-divider />

        <h4 class="section-title">卖点条目</h4>
        <div class="tips muted">
          为产品添加 1~3 个关键卖点：每个卖点包含 场景 / 痛点 / 特点 / 引导 这几类信息。
        </div>
        <div class="bullet-list">
          <div v-for="(item, index) in bullets" :key="item.id" class="bullet-item">
            <div class="bullet-header">
              <span class="index">{{ index + 1 }}</span>
              <div class="bullet-actions">
                <el-button text size="small" @click="duplicateBullet(index)">复制</el-button>
                <el-button text size="small" type="danger" @click="removeBullet(index)" :disabled="bullets.length === 1">
                  删除
                </el-button>
              </div>
            </div>
            <el-form label-width="60px" size="small">
              <el-form-item label="场景">
                <el-input v-model="item.scene" placeholder="例如：早晚通勤、出差、家庭聚会…" />
              </el-form-item>
              <el-form-item label="痛点">
                <el-input v-model="item.pain" placeholder="例如：电量焦虑、夜拍糊、手滑摔机…" />
              </el-form-item>
              <el-form-item label="特点">
                <el-input v-model="item.feature" placeholder="例如：长续航、夜景算法、抗摔机身…" />
              </el-form-item>
              <el-form-item label="引导">
                <el-input v-model="item.guide" placeholder="例如：提问式 / 画面代入式引导语…" />
              </el-form-item>
            </el-form>
          </div>
          <el-button link type="primary" size="small" @click="addBullet">+ 添加卖点条目</el-button>
        </div>
      </div>

      <!-- 中间：提示词预览 -->
      <div class="middle">
        <h4 class="section-title">提示词预览（会发送给 Agent）</h4>
        <el-input v-model="promptPreview" type="textarea" :rows="18" readonly />
      </div>

      <!-- 右侧：话术逻辑与输出 -->
      <div class="right">
        <h4 class="section-title">话术逻辑与风格</h4>
        <div class="toggle-group">
          <div class="toggle-row" v-for="opt in segmentOptions" :key="opt.key">
            <div class="label">{{ opt.label }}</div>
            <el-switch v-model="segments[opt.key]" size="small" />
          </div>
        </div>

        <el-form label-width="60px" size="small" class="style-form">
          <el-form-item label="语气">
            <el-select v-model="style.tone">
              <el-option label="专业" value="专业" />
              <el-option label="亲切" value="亲切" />
              <el-option label="活泼" value="活泼" />
            </el-select>
          </el-form-item>
          <el-form-item label="长度">
            <el-select v-model="style.length">
              <el-option label="短（200-400字）" value="短" />
              <el-option label="中（400-600字）" value="中" />
              <el-option label="长（600字以上）" value="长" />
            </el-select>
          </el-form-item>
        </el-form>

        <el-divider />

        <h4 class="section-title">生成话术</h4>
        <el-input v-model="result" type="textarea" :rows="12" placeholder="点击右上角“生成话术”后会展示在这里" />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sendChat } from '@/api/chat'

const generating = ref(false)

const form = ref({
  liveMode: '单人话术',
  productName: '',
  productSeries: '',
})

let idCounter = 1
const newBullet = () => ({
  id: idCounter++,
  scene: '',
  pain: '',
  feature: '',
  guide: '',
})

const bullets = ref([newBullet()])

const segments = ref({
  scene: true,
  pain: true,
  feature: true,
  guide: true,
})

const segmentOptions = [
  { key: 'scene', label: '先讲使用场景' },
  { key: 'pain', label: '再点出用户痛点' },
  { key: 'feature', label: '自然引出产品特点' },
  { key: 'guide', label: '最后给出引导话术' },
]

const style = ref({
  tone: '专业',
  length: '中',
})

const result = ref('')

const promptPreview = computed(() => {
  const lines = []
  lines.push('你是一名资深 3C 品类直播话术导演，擅长把产品卖点转成主播能直接照读的话术。')
  lines.push('请根据以下信息，生成一段适合直播间口播的产品应用场景话术：')
  lines.push('')
  lines.push(`直播方式：${form.value.liveMode || '未指定'}`)
  lines.push(`产品名称：${form.value.productName || '未指定'}`)
  lines.push(`产品系列：${form.value.productSeries || '未指定'}`)
  lines.push('')
  lines.push('卖点条目（每条包含 场景/痛点/特点/引导）：')
  bullets.value.forEach((b, idx) => {
    lines.push(`-${idx + 1}. 场景：${b.scene || '无'}；痛点：${b.pain || '无'}；特点：${b.feature || '无'}；引导：${b.guide || '无'}`)
  })
  lines.push('')
  lines.push('话术结构偏好：')
  if (segments.value.scene) lines.push('- 先用画面感强的方式讲使用“场景”')
  if (segments.value.pain) lines.push('- 然后点出典型“痛点”，让用户产生共鸣')
  if (segments.value.feature) lines.push('- 自然转入产品“特点”，说明是如何解决痛点的')
  if (segments.value.guide) lines.push('- 最后给出“引导话术”（提问/号召），引导用户停留和下单')
  lines.push('')
  lines.push(`语气：${style.value.tone}`)
  lines.push(`长度偏好：${style.value.length}`)
  lines.push('')
  lines.push('请输出一整段主播可直接照读的话术，不需要解释说明，不要加标题。')
  return lines.join('\n')
})

function addBullet() {
  bullets.value.push(newBullet())
}

function removeBullet(index) {
  if (bullets.value.length === 1) return
  bullets.value.splice(index, 1)
}

function duplicateBullet(index) {
  const src = bullets.value[index]
  bullets.value.splice(index + 1, 0, { ...src, id: newBullet().id })
}

async function generateScript() {
  if (!form.value.productName.trim()) {
    return ElMessage.warning('请先填写产品名称')
  }
  generating.value = true
  try {
    const messages = [{ role: 'user', content: promptPreview.value }]
    const data = await sendChat('dify', messages, 800)
    result.value = data.content || ''
    ElMessage.success('已生成话术')
  } catch (e) {
    ElMessage.error(`生成失败：${e.message || e}`)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped lang="scss">
.scenario-card {
  margin-top: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.title {
  font-weight: 800;
  font-size: 16px;
  color: #111827;
}
.subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6B7280;
}

.scenario-layout {
  display: grid;
  grid-template-columns: 33% 34% 33%;
  gap: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.muted {
  color: #6B7280;
  font-size: 12px;
}

.left {
  border-right: 1px solid #E5E7EB;
  padding-right: 10px;
}
.middle {
  border-right: 1px solid #E5E7EB;
  padding: 0 10px;
}
.right {
  padding-left: 10px;
}

.bullet-list {
  margin-top: 8px;
}
.bullet-item {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  background: #F9FAFB;
}
.bullet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.index {
  font-weight: 700;
  color: #111827;
}
.bullet-actions {
  display: flex;
  gap: 4px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toggle-row .label {
  font-size: 12px;
  color: #374151;
}

.style-form {
  margin-top: 4px;
}
</style>

