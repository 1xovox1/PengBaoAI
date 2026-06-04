<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <h1>我的收藏</h1>
      <el-button :icon="Delete" @click="clearAllFavorites" type="danger" text>
        清空收藏
      </el-button>
    </div>

    <div class="favorites-content">
      <div v-if="favoriteAgents.length === 0" class="empty-state">
        <el-empty description="暂无收藏的Agent" />
      </div>

      <div v-else class="favorites-grid">
        <AgentCard
          v-for="agent in favoriteAgents"
          :key="agent.id"
          :agent="agent"
          @click="openAgentChat(agent)"
          @favorite="toggleFavorite(agent)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import AgentCard from '@/components/AgentCard.vue'

const router = useRouter()

// 这里应该从store或API获取收藏列表
const favoriteAgents = ref([
  {
    id: 2,
    name: '数据报表分析',
    description: '自动分析销售数据，生成可视化报表',
    department: '电商运营组',
    capability: '数据拆解',
    icon: 'DataAnalysis',
    usageCount: 1856,
    rating: 4.9,
    isFavorite: true,
    tags: ['专业']
  },
  {
    id: 5,
    name: '客服话术助手',
    description: '根据客户问题自动生成专业回复话术',
    department: '售后服务组',
    capability: '文案生成',
    icon: 'Service',
    usageCount: 2134,
    rating: 4.8,
    isFavorite: true,
    tags: ['热门']
  }
])

const openAgentChat = (agent) => {
  router.push({
    path: '/chat',
    query: { agentId: agent.id }
  })
}

const toggleFavorite = (agent) => {
  agent.isFavorite = false
  const index = favoriteAgents.value.findIndex(a => a.id === agent.id)
  if (index > -1) {
    favoriteAgents.value.splice(index, 1)
  }
  ElMessage.success('已取消收藏')
}

const clearAllFavorites = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    favoriteAgents.value = []
    ElMessage.success('已清空所有收藏')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.favorites-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
}

.favorites-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #111827;
  }
}

.favorites-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
</style>

