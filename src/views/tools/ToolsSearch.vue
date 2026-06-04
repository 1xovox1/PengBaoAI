<template>
  <div class="tool-page">
    <div class="tool-header">
      <h1 class="tool-title">信息检索（秘塔 AI）</h1>
      <p class="tool-desc">输入关键词，在秘塔搜索中查找资料。秘塔提供权威、实时的信息检索能力。</p>
    </div>
    <el-card shadow="never" class="tool-card">
      <el-form label-width="80px">
        <el-form-item label="检索词">
          <el-input
            v-model="query"
            placeholder="输入要搜索的关键词或问题…"
            clearable
            @keyup.enter="search"
          >
            <template #append>
              <el-button type="primary" :icon="Search" @click="search">在秘塔搜索</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-alert type="info" :closable="false" show-icon class="tip">
        点击「在秘塔搜索」将在新窗口打开秘塔 AI 搜索（metaso.cn），可直接使用其检索与引用能力。
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const query = ref('')
const METASO_SEARCH_URL = 'https://metaso.cn/search'

function search() {
  const q = query.value?.trim()
  if (!q) {
    ElMessage.warning('请输入检索词')
    return
  }
  const url = `${METASO_SEARCH_URL}?q=${encodeURIComponent(q)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped lang="scss">
.tool-page { padding: 20px 24px 32px; }
.tool-header { margin-bottom: 20px; }
.tool-title { margin: 0; font-size: 22px; font-weight: 700; color: #111827; }
.tool-desc { margin: 6px 0 0; font-size: 13px; color: #6b7280; }
.tool-card { border-radius: 12px; border: 1px solid #e5e7eb; max-width: 720px; }
.tip { margin-top: 16px; }
</style>
