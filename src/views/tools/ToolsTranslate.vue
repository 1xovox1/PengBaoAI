<template>
  <div class="tool-page">
    <div class="tool-header">
      <h1 class="tool-title">翻译工具</h1>
      <p class="tool-desc">输入原文，选择目标语言，一键翻译。支持中英日韩等常用语言。</p>
    </div>
    <el-card shadow="never" class="tool-card">
      <el-form label-width="100px">
        <el-form-item label="目标语言">
          <el-select v-model="targetLang" style="width: 220px">
            <el-option label="英语" value="英语" />
            <el-option label="中文" value="中文" />
            <el-option label="日语" value="日语" />
            <el-option label="韩语" value="韩语" />
            <el-option label="法语" value="法语" />
            <el-option label="西班牙语" value="西班牙语" />
          </el-select>
        </el-form-item>
        <el-form-item label="原文">
          <el-input v-model="inputText" type="textarea" :rows="6" placeholder="粘贴需要翻译的文本…" />
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
          <el-button type="primary" :loading="loading" @click="translate">翻译</el-button>
        </el-form-item>
      </el-form>
      <div v-if="outputText" class="output-box">
        <div class="output-label">译文</div>
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

const targetLang = ref('英语')
const inputText = ref('')
const outputText = ref('')
const model = ref('dify')
const loading = ref(false)

async function translate() {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入原文')
    return
  }
  loading.value = true
  outputText.value = ''
  try {
    const prompt = `请将以下内容翻译成${targetLang.value}，只输出译文，不要解释。\n\n${inputText.value}`
    const { content } = await sendChat(model.value, [{ role: 'user', content: prompt }], 2000)
    outputText.value = (content || '').trim()
    if (!outputText.value) ElMessage.warning('未得到译文')
    else ElMessage.success('翻译完成')
  } catch (e) {
    ElMessage.error(e?.response?.data?.error || e?.message || '翻译失败')
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
