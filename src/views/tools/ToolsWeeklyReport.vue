<template>
  <div class="tool-page">
    <div class="tool-header">
      <h1 class="tool-title">周报生成</h1>
      <p class="tool-desc">输入本周工作要点或零散记录，一键生成结构清晰的周报。</p>
    </div>
    <el-card shadow="never" class="tool-card">
      <el-form label-width="100px">
        <el-form-item label="工作要点">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="8"
            placeholder="粘贴本周完成事项、数据、问题、下周计划等（可零散列举）…"
          />
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="model" style="width: 180px">
            <el-option label="Dify" value="dify" />
            <el-option label="GPT" value="gpt-4" />
            <el-option label="Kimi" value="kimi" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Claude" value="claude-3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="generate">生成周报</el-button>
        </el-form-item>
      </el-form>
      <div v-if="outputText" class="output-box">
        <div class="output-label">周报</div>
        <div class="output-content">{{ outputText }}</div>
        <el-button text size="small" @click="copyOutput">复制</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sendChat } from '@/api/chat'

const inputText = ref('')
const outputText = ref('')
const model = ref('dify')
const loading = ref(false)

async function generate() {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入工作要点')
    return
  }
  loading.value = true
  outputText.value = ''
  try {
    const prompt = `请根据以下工作要点，生成一份结构清晰的周报。要求：分块（本周完成 / 数据与成果 / 问题与风险 / 下周计划），语言简洁专业。只输出周报正文。\n\n${inputText.value}`
    const { content } = await sendChat(model.value, [{ role: 'user', content: prompt }], 2500)
    outputText.value = (content || '').trim()
    if (!outputText.value) ElMessage.warning('未得到结果')
    else ElMessage.success('生成完成')
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '生成失败')
  } finally {
    loading.value = false
  }
}

function copyOutput() {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value).then(() => ElMessage.success('已复制')).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped lang="scss">
.tool-page { padding: 20px 24px 32px; }
.tool-header { margin-bottom: 20px; }
.tool-title { margin: 0; font-size: 22px; font-weight: 700; color: #111827; }
.tool-desc { margin: 6px 0 0; font-size: 13px; color: #6b7280; }
.tool-card { border-radius: 12px; border: 1px solid #e5e7eb; max-width: 720px; }
.output-box { margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; }
.output-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; }
.output-content { white-space: pre-wrap; line-height: 1.6; margin-bottom: 8px; }
</style>
