<template>
  <div class="tool-page">
    <div class="tool-header">
      <h1 class="tool-title">文案润色</h1>
      <p class="tool-desc">输入草稿，选择风格，一键润色为更专业、通顺的文案。</p>
    </div>
    <el-card shadow="never" class="tool-card">
      <el-form label-width="100px">
        <el-form-item label="润色风格">
          <el-select v-model="style" style="width: 220px">
            <el-option label="专业正式" value="专业正式" />
            <el-option label="简洁有力" value="简洁有力" />
            <el-option label="活泼口语" value="活泼口语" />
            <el-option label="电商卖点" value="电商卖点" />
          </el-select>
        </el-form-item>
        <el-form-item label="原文">
          <el-input v-model="inputText" type="textarea" :rows="6" placeholder="粘贴需要润色的文案…" />
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
          <el-button type="primary" :loading="loading" @click="polish">润色</el-button>
        </el-form-item>
      </el-form>
      <div v-if="outputText" class="output-box">
        <div class="output-label">润色结果</div>
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

const style = ref('专业正式')
const inputText = ref('')
const outputText = ref('')
const model = ref('dify')
const loading = ref(false)

async function polish() {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入原文')
    return
  }
  loading.value = true
  outputText.value = ''
  try {
    const prompt = `请对以下文案进行润色，风格要求：${style.value}。只输出润色后的正文，不要解释。\n\n${inputText.value}`
    const { content } = await sendChat(model.value, [{ role: 'user', content: prompt }], 2000)
    outputText.value = (content || '').trim()
    if (!outputText.value) ElMessage.warning('未得到结果')
    else ElMessage.success('润色完成')
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '润色失败')
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
