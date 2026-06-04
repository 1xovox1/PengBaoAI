<template>
  <div style="padding: 50px; text-align: center; background: white; min-height: 100vh;">
    <h1 style="color: #1428A0; font-size: 48px; margin-bottom: 20px;">✓ Vue 正常工作</h1>
    <p style="font-size: 24px; color: #666; margin-bottom: 30px;">
      如果你能看到这个页面，说明路由和组件加载都正常
    </p>
    <el-button type="primary" size="large" @click="goHome">
      返回主页
    </el-button>
    <div style="margin-top: 50px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: left;">
      <h3>当前信息：</h3>
      <p>路由路径: {{ $route.path }}</p>
      <p>路由名称: {{ $route.name }}</p>
      <p>时间: {{ new Date().toLocaleString() }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/chat')
}
</script>

