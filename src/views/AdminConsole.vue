<template>
  <div class="admin-console">
    <div class="console-header">
      <h1>数据控制台</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
        <el-button type="primary" :icon="Download" @click="exportData">
          导出数据
        </el-button>
      </div>
    </div>

    <div class="console-content">
      <!-- 数据看板 -->
      <div class="dashboard-section">
        <h2 class="section-title">数据总览</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #1428A0, #1E40E6);">
              <el-icon :size="24"><Coin /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.totalTokens) }}</div>
              <div class="stat-label">Token消耗</div>
              <div class="stat-change positive">+12.5% 较上月</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #34D399);">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.activeUsers) }}</div>
              <div class="stat-label">活跃用户</div>
              <div class="stat-change positive">+8.3% 较上月</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #FBBF24);">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(stats.totalConversations) }}</div>
              <div class="stat-label">对话总数</div>
              <div class="stat-change positive">+15.2% 较上月</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #F87171);">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatNumber(stats.estimatedCost) }}</div>
              <div class="stat-label">费用预估</div>
              <div class="stat-change">基于当前使用量</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="chart-card">
          <h3 class="chart-title">模型使用频率趋势</h3>
          <div class="chart-placeholder">
            <el-icon :size="48" color="#9CA3AF"><DataAnalysis /></el-icon>
            <p>图表区域（可集成 ECharts 或其他图表库）</p>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">业务组活跃度分布</h3>
          <div class="chart-placeholder">
            <el-icon :size="48" color="#9CA3AF"><PieChart /></el-icon>
            <p>图表区域（可集成 ECharts 或其他图表库）</p>
          </div>
        </div>
      </div>

      <!-- 关键词云 -->
      <div class="keywords-section">
        <h2 class="section-title">关键词云</h2>
        <div class="keywords-cloud">
          <el-tag
            v-for="(keyword, index) in keywords"
            :key="keyword.word"
            :size="getKeywordSize(keyword.count)"
            :type="getKeywordType(index)"
            class="keyword-tag"
          >
            {{ keyword.word }} ({{ keyword.count }})
          </el-tag>
        </div>
      </div>

      <!-- 数据管理表 -->
      <div class="data-table-section">
        <h2 class="section-title">对话日志</h2>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部对话" name="all">
            <el-table :data="conversationLogs" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="model" label="模型" width="150" />
              <el-table-column prop="query" label="问题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="timestamp" label="时间" width="180" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button text size="small" @click="viewDetails(scope.row)">
                    查看
                  </el-button>
                  <el-button text size="small" @click="exportLog(scope.row)">
                    导出
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="反馈追踪" name="feedback">
            <el-table :data="feedbackLogs" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="conversationId" label="对话ID" width="120" />
              <el-table-column label="反馈类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'like' ? 'success' : 'danger'">
                    {{ scope.row.type === 'like' ? '点赞' : '点踩' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
              <el-table-column prop="timestamp" label="时间" width="180" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  Coin,
  User,
  ChatDotRound,
  TrendCharts,
  DataAnalysis,
  PieChart
} from '@element-plus/icons-vue'

const dateRange = ref([])
const activeTab = ref('all')

const stats = ref({
  totalTokens: 1250000,
  activeUsers: 342,
  totalConversations: 8567,
  estimatedCost: 12500
})

const keywords = ref([
  { word: '折叠屏', count: 234 },
  { word: '促销脚本', count: 189 },
  { word: '产品参数', count: 156 },
  { word: '数据分析', count: 142 },
  { word: '文案生成', count: 128 },
  { word: '竞品监控', count: 98 },
  { word: '海报设计', count: 87 },
  { word: '客服话术', count: 76 },
  { word: '价格对比', count: 65 },
  { word: '市场趋势', count: 54 }
])

const conversationLogs = ref([
  {
    id: 1001,
    user: '用户***1',
    model: 'GPT-4',
    query: '帮我生成一份关于折叠屏手机的促销文案',
    timestamp: '2024-01-15 10:30:25'
  },
  {
    id: 1002,
    user: '用户***2',
    model: 'Kimi',
    query: '分析一下最近一个月的销售数据趋势',
    timestamp: '2024-01-15 10:28:12'
  },
  {
    id: 1003,
    user: '用户***3',
    model: '鹏宝SFT模型',
    query: '生成一份符合三星品牌调性的产品介绍',
    timestamp: '2024-01-15 10:25:45'
  }
])

const feedbackLogs = ref([
  {
    id: 2001,
    conversationId: 1001,
    type: 'like',
    content: '生成的文案非常符合品牌调性，质量很高',
    timestamp: '2024-01-15 10:31:00'
  },
  {
    id: 2002,
    conversationId: 1002,
    type: 'dislike',
    content: '数据分析不够深入，希望提供更多洞察',
    timestamp: '2024-01-15 10:29:30'
  }
])

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getKeywordSize = (count) => {
  if (count > 150) return 'large'
  if (count > 100) return 'default'
  return 'small'
}

const getKeywordType = (index) => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[index % types.length]
}

const handleDateChange = () => {
  ElMessage.info('日期范围已更新')
  // 重新加载数据
}

const exportData = () => {
  ElMessage.success('数据导出功能开发中...')
}

const viewDetails = (row) => {
  ElMessage.info(`查看对话详情：${row.id}`)
}

const exportLog = (row) => {
  ElMessage.success(`导出对话日志：${row.id}`)
}
</script>

<style scoped lang="scss">
.admin-console {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
  overflow: hidden;
}

.console-header {
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

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.console-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
}

.dashboard-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 4px;
    }

    .stat-change {
      font-size: 12px;
      color: #9CA3AF;

      &.positive {
        color: #10B981;
      }
    }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 20px;
  }

  .chart-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #F9FAFB;
    border-radius: 8px;
    color: #9CA3AF;

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }
}

.keywords-section {
  margin-bottom: 32px;
}

.keywords-cloud {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 200px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .keyword-tag {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.data-table-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>

