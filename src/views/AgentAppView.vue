<template>
  <div class="agent-app">
    <div class="app-header">
      <el-button text class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span style="margin-left: 6px;">返回</span>
      </el-button>

      <div class="header-main" v-if="agent">
        <div class="agent-title">
          <div class="agent-icon">
            <el-icon :size="22"><component :is="agent.icon" /></el-icon>
          </div>
          <div class="title-text">
            <div class="name">{{ agent.name }}</div>
            <div class="meta">
              <span class="pill">{{ agent.department }}</span>
              <span class="pill">{{ agent.capability }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="header-right" v-if="agent">
        <el-button v-if="agent.appType === 'external' && agent.appUrl" type="primary" @click="openExternal">
          打开系统
        </el-button>
        <el-button text :class="{ favorited: agent.isFavorite }" @click="toggleFavorite">
          <el-icon><component :is="agent.isFavorite ? StarFilled : Star" /></el-icon>
          <span style="margin-left: 6px;">{{ agent.isFavorite ? '已收藏' : '收藏' }}</span>
        </el-button>
      </div>
    </div>

    <div v-if="!agent" class="empty">
      <el-empty description="Agent 不存在或已下线" />
    </div>

    <div v-else class="app-body">
      <el-tabs v-model="activeTab" class="app-tabs">
        <el-tab-pane name="overview" label="概览" />
        <el-tab-pane name="workbench" label="工作台" />
        <el-tab-pane name="settings" label="设置" />
      </el-tabs>

      <div class="tab-content">
        <div v-if="activeTab === 'overview'" class="overview">
          <el-card shadow="never" class="card">
            <template #header>
              <div class="card-title">这个小系统做什么？</div>
            </template>
            <div class="desc">{{ agent.description }}</div>
            <div class="overview-kpis">
              <div class="kpi">
                <div class="kpi-label">使用次数</div>
                <div class="kpi-value">{{ agent.usageCount }}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">评分</div>
                <div class="kpi-value">{{ agent.rating }}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">模块数</div>
                <div class="kpi-value">{{ (agent.modules || []).length }}</div>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="card">
            <template #header>
              <div class="card-title">功能模块</div>
            </template>
            <div class="module-list">
              <el-tag v-for="m in agent.modules || []" :key="m" effect="plain">{{ m }}</el-tag>
            </div>
          </el-card>
        </div>

        <div v-else-if="activeTab === 'workbench'" class="workbench">
          <div v-if="agent.appType === 'external' && agent.appUrl" class="external">
            <iframe class="app-iframe" :src="agent.appUrl" />
          </div>

          <div v-else class="internal">
            <div class="internal-left">
              <div class="side-title">模块</div>
              <el-menu :default-active="activeModule" class="module-menu" @select="activeModule = $event">
                <el-menu-item v-for="m in agent.modules || []" :key="m" :index="m">{{ m }}</el-menu-item>
              </el-menu>
            </div>

            <div class="internal-main">
              <CompetitorMonitorWorkbench v-if="agent.slug === 'competitor-monitor'" :active-module="activeModule" />
              <GenericWorkbench v-else :agent="agent" :active-module="activeModule" />
            </div>
          </div>
        </div>

        <div v-else class="settings">
          <el-card shadow="never" class="card">
            <template #header>
              <div class="card-title">上线形态</div>
            </template>
            <el-form label-width="120px">
              <el-form-item label="承载方式">
                <el-tag type="info" effect="plain">
                  {{ agent.appType === 'external' ? '外部系统（iframe/跳转）' : '内置工作台（本项目承载）' }}
                </el-tag>
              </el-form-item>
              <el-form-item v-if="agent.appType === 'external'" label="系统地址">
                <el-input :model-value="agent.appUrl" readonly />
              </el-form-item>
              <el-form-item label="说明">
                <div class="hint">
                  后续你只需要给每个 Agent 配一个 <code>appUrl</code>（外部小系统）或配置模块与权限（内置小系统），就能做到“点进去就是一个系统”。
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star, StarFilled } from '@element-plus/icons-vue'
import { agentIconMap } from '@/data/agents'
import { getAgent } from '@/api/agents'

const route = useRoute()
const router = useRouter()

const agentId = computed(() => route.params.agentId)
const agent = ref(null)

const activeTab = ref('workbench')
const activeModule = ref('')

onMounted(async () => {
  try {
    const a = await getAgent(agentId.value)
    // icon string -> component
    const iconComp = a?.icon && agentIconMap[a.icon] ? agentIconMap[a.icon] : agentIconMap.Document
    agent.value = { ...a, icon: iconComp }
  } catch (e) {
    agent.value = null
  }
})

watch(
  agent,
  (a) => {
    if (!a) return
    const mods = a.modules || []
    activeModule.value = mods[0] || ''
  },
  { immediate: true }
)

const goBack = () => {
  router.push('/agents')
}

const openExternal = () => {
  if (!agent.value?.appUrl) return
  window.open(agent.value.appUrl, '_blank', 'noopener,noreferrer')
}

const toggleFavorite = () => {
  if (!agent.value) return
  agent.value.isFavorite = !agent.value.isFavorite
  ElMessage.success(agent.value.isFavorite ? '已添加到收藏' : '已取消收藏')
}

/**
 * 竞品监控示例：演示“点进去是一个系统”的结构（看板/规则/订阅/报告）
 * 后续接后端后，这里替换为真实 API。
 */
const CompetitorMonitorWorkbench = {
  props: { activeModule: { type: String, default: '' } },
  template: `
    <div class="workbench-inner">
      <el-alert
        title="这里是“竞品监控”小系统的工作台示例（Mock 数据）"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px;"
      />

      <template v-if="activeModule === '监控看板'">
        <div class="kpi-grid">
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">监控商品</div><div class="kpi-value">28</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">今日变价</div><div class="kpi-value">6</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">预警中</div><div class="kpi-value">2</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">更新频率</div><div class="kpi-value">15min</div></el-card>
        </div>
        <el-card shadow="never">
          <template #header><div class="card-title">最新变价</div></template>
          <el-table :data="rows" style="width: 100%">
            <el-table-column prop="name" label="竞品" min-width="160" />
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="from" label="原价" width="120" />
            <el-table-column prop="to" label="现价" width="120" />
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="status" label="状态" width="120" />
          </el-table>
        </el-card>
      </template>

      <template v-else-if="activeModule === '监控规则'">
        <el-card shadow="never">
          <template #header><div class="card-title">规则配置</div></template>
          <el-form label-width="120px">
            <el-form-item label="监控平台">
              <el-select model-value="京东" style="width: 240px">
                <el-option label="京东" value="京东" />
                <el-option label="天猫" value="天猫" />
                <el-option label="拼多多" value="拼多多" />
              </el-select>
            </el-form-item>
            <el-form-item label="触发阈值">
              <el-input model-value="降价 >= 50 元 或 >= 5%" style="max-width: 520px" />
            </el-form-item>
            <el-form-item label="频率">
              <el-radio-group model-value="15min">
                <el-radio-button label="5min" />
                <el-radio-button label="15min" />
                <el-radio-button label="1h" />
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存规则</el-button>
              <el-button>测试一次</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>

      <template v-else-if="activeModule === '订阅提醒'">
        <el-card shadow="never">
          <template #header><div class="card-title">订阅渠道</div></template>
          <el-form label-width="120px">
            <el-form-item label="企业微信">
              <el-switch model-value />
            </el-form-item>
            <el-form-item label="邮件">
              <el-switch model-value="false" />
            </el-form-item>
            <el-form-item label="提醒人群">
              <el-select model-value="电商运营组" style="width: 240px">
                <el-option label="电商运营组" value="电商运营组" />
                <el-option label="市场推广组" value="市场推广组" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存订阅</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>

      <template v-else>
        <el-card shadow="never">
          <template #header><div class="card-title">对比报告</div></template>
          <div class="hint">这里可接入报表/下载/自动生成周报（当前为占位）。</div>
        </el-card>
      </template>
    </div>
  `,
  data() {
    return {
      rows: [
        { name: '竞品A', sku: 'A-128', from: '¥1999', to: '¥1899', time: '10:12', status: '降价' },
        { name: '竞品B', sku: 'B-256', from: '¥2499', to: '¥2599', time: '09:40', status: '涨价' },
        { name: '竞品C', sku: 'C-64', from: '¥999', to: '¥899', time: '08:55', status: '降价' }
      ]
    }
  }
}

const GenericWorkbench = {
  props: {
    agent: { type: Object, required: true },
    activeModule: { type: String, default: '' }
  },
  template: `
    <div class="workbench-inner">
      <el-alert
        :title="'这里是“' + agent.name + '”的小系统工作台占位（后续可接入真实功能模块）'"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px;"
      />
      <el-card shadow="never">
        <template #header><div class="card-title">当前模块：{{ activeModule || '未选择' }}</div></template>
        <div class="hint">
          你可以把每个模块理解为一个独立页面/功能：例如“生成器/规则/看板/历史/导出”等。
          后续只要把模块路由、权限、API 接上，就能形成真正可上线的小系统。
        </div>
      </el-card>
    </div>
  `
}
</script>

<style scoped lang="scss">
.agent-app {
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .back-btn {
    color: #111827;
  }

  .header-main {
    flex: 1;
    min-width: 0;
  }

  .agent-title {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .agent-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(135deg, #1428A0, #1E40E6);
      flex-shrink: 0;
    }

    .title-text {
      min-width: 0;

      .name {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .meta {
        margin-top: 4px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;

        .pill {
          font-size: 12px;
          color: #4B5563;
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          padding: 2px 8px;
          border-radius: 999px;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .favorited {
      color: #F59E0B;
    }
  }
}

.app-body {
  padding: 16px 20px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }
}

.tab-content {
  flex: 1;
}

.card {
  margin-bottom: 12px;
}

.card-title {
  font-weight: 700;
  color: #111827;
}

.desc {
  color: #4B5563;
  line-height: 1.7;
}

.overview-kpis {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  .kpi {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 12px;

    .kpi-label {
      font-size: 12px;
      color: #6B7280;
    }
    .kpi-value {
      margin-top: 6px;
      font-size: 20px;
      font-weight: 800;
      color: #111827;
    }
  }
}

.module-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workbench {
  height: calc(100vh - 170px);
}

.external {
  height: 100%;
}

.app-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: white;
}

.internal {
  height: 100%;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 12px;
}

.internal-left {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px;
  overflow: auto;

  .side-title {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }

  .module-menu {
    border-right: none;
  }
}

.internal-main {
  background: transparent;
  overflow: auto;
}

.workbench-inner {
  height: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  .kpi-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
  }

  .kpi-label {
    font-size: 12px;
    color: #6B7280;
  }
  .kpi-value {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 800;
    color: #111827;
  }
}

.hint {
  color: #6B7280;
  line-height: 1.7;

  code {
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    padding: 0 6px;
    border-radius: 6px;
    color: #111827;
  }
}

.empty {
  padding: 40px 20px;
}
</style>




