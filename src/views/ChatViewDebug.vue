<template>
  <div style="padding: 20px; background: white; min-height: 100vh;">
    <h1 style="color: #1428A0;">ChatView 调试页面</h1>
    <p>如果你能看到这个页面，说明路由正常</p>
    
    <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3>测试Element Plus组件：</h3>
      <el-button type="primary">测试按钮</el-button>
      <el-select v-model="testValue" placeholder="测试下拉框" style="margin-left: 10px;">
        <el-option label="选项1" value="1" />
        <el-option label="选项2" value="2" />
      </el-select>
    </div>
    
    <div style="margin-top: 20px;">
      <el-button @click="goToChat">跳转到对话页</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const testValue = ref('')

const goToChat = () => {
  router.push('/chat')
}
</script>

