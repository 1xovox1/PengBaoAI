import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/chat',
    children: [
      {
        path: 'test',
        name: 'Test',
        component: () => import('@/views/TestView.vue'),
        meta: { title: '测试页面' }
      },
      {
        path: 'simple',
        name: 'Simple',
        component: () => import('@/views/SimpleTest.vue'),
        meta: { title: '简单测试' }
      },
      {
        path: 'chat-debug',
        name: 'ChatDebug',
        component: () => import('@/views/ChatViewDebug.vue'),
        meta: { title: '对话页调试' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/ChatView.vue'),
        meta: { title: '智能对话' }
      },
      {
        path: 'vision',
        name: 'Vision',
        component: () => import('@/views/VisionStudio.vue'),
        meta: { title: '视觉创作' }
      },
      {
        path: 'agents',
        name: 'Agents',
        component: () => import('@/views/AgentMarketplace.vue'),
        meta: { title: 'Agent超市' }
      },
      {
        path: 'agents/:agentId',
        name: 'AgentApp',
        component: () => import('@/views/AgentAppView.vue'),
        meta: { title: 'Agent工作台' }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/FavoritesView.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'console',
        name: 'Console',
        component: () => import('@/views/AdminConsole.vue'),
        meta: { title: '数据控制台' }
      },
      {
        path: 'ads',
        name: 'AdsLoop',
        component: () => import('@/views/AdsLoopView.vue'),
        meta: { title: '投放闭环' }
      },
      {
        path: 'live',
        name: 'LiveLoop',
        component: () => import('@/views/LiveLoopView.vue'),
        meta: { title: '直播闭环' }
      },
      {
        path: 'tools/translate',
        name: 'ToolsTranslate',
        component: () => import('@/views/tools/ToolsTranslate.vue'),
        meta: { title: '翻译工具' }
      },
      {
        path: 'tools/search',
        name: 'ToolsSearch',
        component: () => import('@/views/tools/ToolsSearch.vue'),
        meta: { title: '信息检索（秘塔）' }
      },
      {
        path: 'tools/polish',
        name: 'ToolsPolish',
        component: () => import('@/views/tools/ToolsPolish.vue'),
        meta: { title: '文案润色' }
      },
      {
        path: 'tools/weekly-report',
        name: 'ToolsWeeklyReport',
        component: () => import('@/views/tools/ToolsWeeklyReport.vue'),
        meta: { title: '周报生成' }
      },
      {
        path: 'tools/meeting-minutes',
        name: 'ToolsMeetingMinutes',
        component: () => import('@/views/tools/ToolsMeetingMinutes.vue'),
        meta: { title: '会议纪要' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

