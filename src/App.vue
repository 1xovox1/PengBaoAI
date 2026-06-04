<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('鹏宝AI应用已启动')
})
</script>

<style scoped>
</style>

