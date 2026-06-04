<template>
  <div class="agent-marketplace">
    <!-- 顶部：标题 + 搜索/筛选（吸顶） -->
    <div class="marketplace-header">
      <div class="title-row">
        <div class="title-left">
          <h2 class="page-title">通用工作工具</h2>
          <div class="page-subtitle">跨业务线的日常工具区：翻译、文案、报表、文件处理等</div>
        </div>

        <div class="title-right">
          <el-switch v-model="onlyFavorites" inline-prompt active-text="收藏" inactive-text="全部" />
          <el-button :icon="Refresh" @click="resetAll">重置</el-button>
        </div>
      </div>

      <div class="toolbar-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索 Agent 名称或描述…"
          :prefix-icon="Search"
          clearable
          class="search-input"
        />

        <el-select v-model="sortBy" class="sort-select" placeholder="排序">
          <el-option label="按热度" value="usage" />
          <el-option label="按评分" value="rating" />
          <el-option label="按名称" value="name" />
        </el-select>
      </div>

      <el-tabs v-model="activeDepartment" class="dept-tabs" stretch>
        <el-tab-pane :name="ALL" label="全部" />
        <el-tab-pane v-for="dept in departments" :key="dept" :name="dept" :label="dept" />
      </el-tabs>

      <div class="capability-row">
        <div class="capability-label">能力维度</div>
        <el-radio-group v-model="activeCapability" size="small" class="capability-chips">
          <el-radio-button :label="ALL">全部</el-radio-button>
          <el-radio-button v-for="cap in capabilities" :key="cap" :label="cap">
            {{ cap }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 快捷工具（内置） -->
    <div class="quick-tools">
      <div class="quick-tools-label">快捷工具</div>
      <div class="quick-tools-grid">
        <div
          v-for="t in builtinTools"
          :key="t.path"
          class="quick-tool-card"
          @click="router.push(t.path)"
        >
          <span class="quick-tool-icon">{{ t.icon }}</span>
          <span class="quick-tool-name">{{ t.name }}</span>
          <span class="quick-tool-desc">{{ t.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 结果区 -->
    <div class="marketplace-content">
      <div v-if="visibleAgents.length === 0" class="empty-result">
        <el-empty description="没有找到匹配的Agent" />
      </div>

      <template v-else>
        <div class="result-summary">
          <span class="count">{{ visibleAgents.length }}</span>
          <span class="text">个 Agent</span>
        </div>

        <!-- “全部能力”时按能力折叠分组（只展示有结果的分组） -->
        <el-collapse v-if="activeCapability === ALL" v-model="openCapabilities" class="cap-collapse">
          <el-collapse-item
            v-for="group in capabilityGroups"
            :key="group.capability"
            :name="group.capability"
          >
            <template #title>
              <div class="cap-title">
                <span class="cap-name">{{ group.capability }}</span>
                <span class="cap-count">{{ group.agents.length }}</span>
              </div>
            </template>

            <div class="agent-grid">
              <AgentCard
                v-for="agent in group.agents"
                :key="agent.id"
                :agent="agent"
                @click="openAgentApp(agent)"
                @favorite="toggleFavorite(agent)"
              />
            </div>
          </el-collapse-item>
        </el-collapse>

        <!-- 选中具体能力时直接展示网格 -->
        <div v-else class="agent-grid">
          <AgentCard
            v-for="agent in visibleAgents"
            :key="agent.id"
            :agent="agent"
            @click="openAgentApp(agent)"
            @favorite="toggleFavorite(agent)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import AgentCard from '@/components/AgentCard.vue'
import { departments, capabilities } from '@/data/agents'
import { listAgents } from '@/api/agents'

const router = useRouter()

const ALL = 'ALL'

const builtinTools = [
  { path: '/tools/translate', name: '翻译工具', desc: '中英日韩等多语言翻译', icon: '🌐' },
  { path: '/tools/search', name: '信息检索（秘塔）', desc: '接入秘塔 AI 检索', icon: '🔍' },
  { path: '/tools/polish', name: '文案润色', desc: '专业/电商/口语风格润色', icon: '✨' },
  { path: '/tools/weekly-report', name: '周报生成', desc: '工作要点一键成周报', icon: '📋' },
  { path: '/tools/meeting-minutes', name: '会议纪要', desc: '记录整理成结构化纪要', icon: '📝' },
]

const searchKeyword = ref('')
const onlyFavorites = ref(false)
const sortBy = ref('usage')

const activeDepartment = ref(ALL)
const activeCapability = ref(ALL)
const openCapabilities = ref([])

const agents = ref([])

onMounted(async () => {
  try {
    agents.value = await listAgents()
  } catch (e) {
    ElMessage.error(`加载 Agent 失败：${e.message || e}`)
  }
})

const visibleAgents = computed(() => {
  let result = agents.value.slice()

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(agent =>
      agent.name.toLowerCase().includes(keyword) ||
      agent.description.toLowerCase().includes(keyword)
    )
  }

  if (activeDepartment.value !== ALL) {
    result = result.filter(agent => agent.department === activeDepartment.value)
  }

  if (activeCapability.value !== ALL) {
    result = result.filter(agent => agent.capability === activeCapability.value)
  }

  if (onlyFavorites.value) {
    result = result.filter(agent => agent.isFavorite)
  }

  if (sortBy.value === 'usage') {
    result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  } else if (sortBy.value === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh-Hans-CN'))
  }

  return result
})

const capabilityGroups = computed(() => {
  if (activeCapability.value !== ALL) {
    return [
      {
        capability: activeCapability.value,
        agents: visibleAgents.value
      }
    ]
  }

  return capabilities
    .map(cap => ({
      capability: cap,
      agents: visibleAgents.value.filter(a => a.capability === cap)
    }))
    .filter(group => group.agents.length > 0)
})

const resetAll = () => {
  searchKeyword.value = ''
  onlyFavorites.value = false
  sortBy.value = 'usage'
  activeDepartment.value = ALL
  activeCapability.value = ALL
  openCapabilities.value = capabilities.slice()
}

const openAgentApp = (agent) => {
  ElMessage.success(`正在打开 ${agent.name} 工作台...`)
  router.push({
    path: `/agents/${agent.id}`
  })
}

const toggleFavorite = (agent) => {
  agent.isFavorite = !agent.isFavorite
  ElMessage.success(agent.isFavorite ? '已添加到收藏' : '已取消收藏')
}

watch(
  [activeDepartment, activeCapability, searchKeyword, onlyFavorites],
  () => {
    if (activeCapability.value === ALL) {
      // 仅展开有结果的分组，避免一堆空折叠项造成“乱”
      openCapabilities.value = capabilityGroups.value.map(g => g.capability)
    } else {
      openCapabilities.value = []
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.agent-marketplace {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
}

.marketplace-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 16px 24px 8px;
  background: rgba(249, 250, 251, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #E5E7EB;

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;

    .title-left {
      min-width: 0;

      .page-title {
        font-size: 22px;
        font-weight: 700;
        color: #111827;
        letter-spacing: 0.2px;
      }

      .page-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: #6B7280;
      }
    }

    .title-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
  }

  .toolbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .search-input {
      flex: 1;
      min-width: 260px;
      max-width: 720px;
    }

    .sort-select {
      width: 140px;
      flex-shrink: 0;
    }
  }

  .dept-tabs {
    margin-top: 8px;
  }

  .capability-row {
    margin-top: 8px;
    display: flex;
    gap: 12px;
    align-items: center;
    padding-bottom: 8px;

    .capability-label {
      font-size: 13px;
      color: #4B5563;
      font-weight: 600;
      flex-shrink: 0;
    }

    .capability-chips {
      flex: 1;
      min-width: 0;
      overflow: auto;
      padding-bottom: 2px;

      :deep(.el-radio-button__inner) {
        border-radius: 999px;
      }
    }
  }
}

.quick-tools {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;

  .quick-tools-label {
    font-size: 13px;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 12px;
  }

  .quick-tools-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .quick-tool-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 140px;
    max-width: 180px;
    padding: 14px 16px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #1428A0;
      background: #EFF6FF;
    }

    .quick-tool-icon {
      font-size: 24px;
      margin-bottom: 6px;
    }

    .quick-tool-name {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .quick-tool-desc {
      font-size: 12px;
      color: #6B7280;
    }
  }
}

.marketplace-content {
  flex: 1;
  padding: 16px 24px 24px;
}

.result-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 8px 0 12px;
  color: #6B7280;

  .count {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .text {
    font-size: 13px;
  }
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.cap-collapse {
  :deep(.el-collapse-item__header) {
    padding: 0 12px;
    border-radius: 10px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    margin-bottom: 10px;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 6px 0 18px;
  }

  .cap-title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .cap-name {
      font-weight: 700;
      color: #111827;
    }

    .cap-count {
      font-size: 12px;
      color: #6B7280;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      padding: 2px 8px;
      border-radius: 999px;
    }
  }
}

.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>

