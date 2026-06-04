<template>
  <div class="tool-page">
    <div class="tool-header">
      <h1 class="tool-title">会议纪要</h1>
      <p class="tool-desc">输入会议记录或录音转写稿，一键整理成结构化的会议纪要（议题、结论、待办）。</p>
    </div>
    <el-card shadow="never" class="tool-card">
      <el-form label-width="100px">
        <el-form-item label="会议记录">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="8"
            placeholder="粘贴会议记录、发言要点或录音转写内容…"
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
          <el-button type="primary" :loading="loading" @click="generate">生成纪要</el-button>
        </el-form-item>
      </el-form>
      <div v-if="outputText" class="output-box">
        <div class="output-label">会议纪要</div>
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
    ElMessage.warning('请输入会议记录')
    return
  }
  loading.value = true
  outputText.value = ''
  try {
    const prompt = `请将以下会议记录整理成结构化会议纪要。要求包含：会议主题、时间（如有）、讨论议题、主要结论/决议、待办事项（负责人+截止时间如有）。格式清晰，只输出纪要正文。\n\n${inputText.value}`
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
