<template>
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <h1 v-if="!sidebarCollapsed">鹏宝AI</h1>
          <span v-else class="logo-icon">P</span>
        </div>
        <el-button
          text
          @click="toggleSidebar"
          class="collapse-btn"
        >
          <el-icon><component :is="sidebarCollapsed ? Expand : Fold" /></el-icon>
        </el-button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="user-info">
          <el-avatar :size="32" :src="userAvatar" />
          <span class="username">{{ userName }}</span>
          <el-button size="small" text class="login-btn" @click="loginDialog = true">
            {{ isLoggedIn ? '已登录' : '登录' }}
          </el-button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 右侧辅助栏（可选） -->
    <aside v-if="showHelperBar" class="helper-bar">
      <div class="helper-header">
        <h3>{{ helperBarTitle }}</h3>
        <el-button text @click="showHelperBar = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="helper-content">
        <slot name="helper-content"></slot>
      </div>
    </aside>
  </div>

  <el-dialog v-model="loginDialog" title="内部登录" width="420px">
    <el-form label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username" placeholder="随便填，用于审计显示" />
      </el-form-item>
      <el-form-item label="口令">
        <el-input v-model="loginForm.password" type="password" show-password placeholder="管理员口令（server/.env 的 AUTH_PASSWORD）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="loginDialog=false">取消</el-button>
      <el-button type="primary" :loading="loggingIn" @click="doLogin">登录</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatDotRound,
  Grid,
  Star,
  DataAnalysis,
  TrendCharts,
  VideoCamera,
  Setting,
  Close,
  Expand,
  Fold,
  Picture
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login as apiLogin, getAuthToken } from '@/api/auth'

const route = useRoute()
const sidebarCollapsed = ref(false)
const showHelperBar = ref(false)
const helperBarTitle = ref('辅助信息')

const userName = ref('运营人员')
const userAvatar = ref('')

const loginDialog = ref(false)
const loggingIn = ref(false)
const loginForm = ref({ username: '', password: '' })

const isLoggedIn = computed(() => !!getAuthToken())

const doLogin = async () => {
  loggingIn.value = true
  try {
    await apiLogin({ username: loginForm.value.username, password: loginForm.value.password })
    ElMessage.success('登录成功')
    loginDialog.value = false
  } catch (e) {
    ElMessage.error(`登录失败：${e?.response?.data?.error || e.message || e}`)
  } finally {
    loggingIn.value = false
  }
}

const navItems = [
  { path: '/chat', label: '智能对话', icon: ChatDotRound },
  { path: '/vision', label: '视觉创作', icon: Picture },
  { path: '/agents', label: '通用工具', icon: Grid },
  { path: '/favorites', label: '我的收藏', icon: Star },
  { path: '/ads', label: '投放闭环', icon: TrendCharts },
  { path: '/live', label: '直播闭环', icon: VideoCamera },
  { path: '/console', label: '数据控制台', icon: DataAnalysis },
  { path: '/settings', label: '系统设置', icon: Setting }
]

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

defineExpose({
  showHelperBar,
  helperBarTitle
})
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1428A0 0%, #1E40E6 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: white;
    }

    .logo-icon {
      font-size: 24px;
      font-weight: 600;
    }
  }

  .collapse-btn {
    color: white;
    font-size: 18px;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;

  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.3s;
    margin: 4px 12px;
    border-radius: 8px;

    .el-icon {
      margin-right: 12px;
      font-size: 20px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    &.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-weight: 500;
    }
  }
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .username {
      font-size: 14px;
      color: white;
    }

    .login-btn {
      margin-left: auto;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.main-content {
  flex: 1;
  overflow: auto;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
}

.helper-bar {
  width: 320px;
  background: white;
  border-left: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);

  .helper-header {
    padding: 16px 20px;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
  }

  .helper-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
}
</style>

