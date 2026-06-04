<template>
  <div class="chat-layout">
    <!-- 左侧历史记录 -->
    <aside class="history-panel">
      <div class="history-header">
        <div class="history-title">历史对话</div>
        <el-button type="primary" plain size="small" @click="startNewChat">新对话</el-button>
      </div>
      <el-input
        v-model="historySearch"
        placeholder="搜索历史会话"
        size="small"
        clearable
        class="history-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="history-list">
        <div
          v-for="item in filteredHistories"
          :key="item.id"
          class="history-item"
          :class="{ active: item.model === selectedModel }"
          @click="switchHistory(item)"
        >
          <div class="history-icon">{{ getModelIcon(item.model) }}</div>
          <div class="history-text">
            <div class="history-name">{{ item.title }}</div>
            <div class="history-meta">{{ getModelName(item.model) }} · {{ item.count }} 条</div>
          </div>
        </div>
        <div v-if="filteredHistories.length === 0" class="history-empty">暂无历史</div>
      </div>
    </aside>

    <!-- 右侧主区域 -->
    <div class="chat-view">
      <!-- 顶部工具栏 -->
      <div class="chat-header">
        <div class="header-left">
          <el-button class="model-picker-btn" type="primary" plain @click="modelPickerVisible = true">
            <div class="model-picker-icon">{{ getModelIcon(selectedModel) }}</div>
            <div class="model-picker-text">
              <div class="label">当前模型</div>
              <div class="name">{{ getModelName(selectedModel) }}</div>
            </div>
            <el-icon class="model-picker-arrow"><ArrowDown /></el-icon>
          </el-button>
        </div>

        <div class="header-right">
          <el-button text @click="showPromptTemplates = true">
            <el-icon><Document /></el-icon>
            <span style="margin-left: 4px;">Prompt模板</span>
          </el-button>
          <el-button text @click="showFileCenter = true">
            <el-icon><FolderOpened /></el-icon>
            <span style="margin-left: 4px;">文件中心</span>
          </el-button>
        </div>
      </div>

      <!-- 模型选择弹窗 -->
      <el-dialog
        v-model="modelPickerVisible"
        title="选择模型"
        width="760px"
        class="model-picker-dialog"
      >
        <div class="model-picker-search">
          <el-input
            v-model="modelSearch"
            placeholder="搜索模型名称或标签"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-tabs v-model="modelTab">
          <el-tab-pane label="国内模型" name="domestic">
            <div class="model-grid">
              <el-card
                v-for="m in filteredModels.domestic"
                :key="m.id"
                class="model-card"
                shadow="hover"
                @click="selectModel(m.id)"
              >
                <div class="model-card-header">
                  <span class="model-icon">{{ getModelIcon(m.id) }}</span>
                  <span class="model-name">{{ m.name }}</span>
                  <el-tag size="small" :type="m.tagType || 'info'">{{ m.tag }}</el-tag>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="国外模型" name="foreign">
            <div class="model-grid">
              <el-card
                v-for="m in filteredModels.foreign"
                :key="m.id"
                class="model-card"
                shadow="hover"
                @click="selectModel(m.id)"
              >
                <div class="model-card-header">
                  <span class="model-icon">{{ getModelIcon(m.id) }}</span>
                  <span class="model-name">{{ m.name }}</span>
                  <el-tag size="small" :type="m.tagType || 'primary'">{{ m.tag }}</el-tag>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Dify Agent" name="dify">
            <div class="model-grid">
              <el-card
                v-for="m in filteredModels.dify"
                :key="m.id"
                class="model-card"
                shadow="hover"
                @click="selectModel(m.id)"
              >
                <div class="model-card-header">
                  <span class="model-icon">{{ getModelIcon(m.id) }}</span>
                  <span class="model-name">{{ m.name }}</span>
                  <el-tag size="small" type="success">{{ m.tag }}</el-tag>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="鹏宝专属" name="pengbao">
            <div class="model-grid">
              <el-card
                v-for="m in filteredModels.pengbao"
                :key="m.id"
                class="model-card"
                shadow="hover"
                @click="selectModel(m.id)"
              >
                <div class="model-card-header">
                  <span class="model-icon">{{ getModelIcon(m.id) }}</span>
                  <span class="model-name">{{ m.name }}</span>
                  <el-tag size="small" type="warning">{{ m.tag }}</el-tag>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>

      <!-- 对话区域 -->
      <div class="chat-container" ref="chatContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-content">
            <el-icon :size="64" color="#9CA3AF"><ChatDotRound /></el-icon>
            <h3>开始你的智能对话</h3>
            <p>选择一个AI模型，输入你的问题开始对话</p>
            <div class="quick-prompts">
              <el-tag
                v-for="prompt in quickPrompts"
                :key="prompt"
                @click="insertPrompt(prompt)"
                class="prompt-tag"
                effect="plain"
              >
                {{ prompt }}
              </el-tag>
            </div>
          </div>
        </div>

        <div v-else class="messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-item"
            :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
          >
            <div class="message-content">
              <div class="message-header">
                <el-avatar :size="32" :src="message.avatar">
                  {{ message.role === 'user' ? '我' : getModelIcon(message.model) }}
                </el-avatar>
                <span class="message-role">{{ message.role === 'user' ? '我' : getModelName(message.model) }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div v-if="message.role === 'assistant'" class="message-actions">
                <el-button text size="small" @click="regenerateMessage(index)">
                  <el-icon><Refresh /></el-icon>
                  <span style="margin-left: 4px;">重新生成</span>
                </el-button>
                <el-button text size="small" @click="copyMessage(message.content)">
                  <el-icon><CopyDocument /></el-icon>
                  <span style="margin-left: 4px;">复制</span>
                </el-button>
                <el-button text size="small" @click="saveAsAgent(message)">
                  <el-icon><Star /></el-icon>
                  <span style="margin-left: 4px;">保存为Agent</span>
                </el-button>
                <el-button-group>
                  <el-button text size="small" @click="feedbackMessage(index, 'like')" title="点赞">
                    <el-icon><CircleCheck /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="feedbackMessage(index, 'dislike')" title="点踩">
                    <el-icon><CircleClose /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="message-item ai-message">
            <div class="message-content">
              <div class="message-header">
                <el-avatar :size="32">{{ getModelIcon(selectedModel) }}</el-avatar>
                <span class="message-role">{{ getModelName(selectedModel) }}</span>
              </div>
              <div class="message-text">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在思考中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="input-toolbar">
          <el-button text size="small" @click="handleImageUpload">
            <el-icon><Picture /></el-icon>
            <span style="margin-left: 4px;">图片</span>
          </el-button>
          <el-button text size="small" @click="handleFileUpload">
            <el-icon><Document /></el-icon>
            <span style="margin-left: 4px;">文件</span>
          </el-button>
        </div>
        <div class="input-wrapper">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入你的问题..."
            @keydown.ctrl.enter="sendMessage"
            @keydown.meta.enter="sendMessage"
            class="message-input"
          />
          <el-button
            type="primary"
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
            class="send-btn"
          >
            <el-icon><Promotion /></el-icon>
            <span style="margin-left: 4px;">发送</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Refresh,
  CopyDocument,
  Star,
  CircleCheck,
  CircleClose,
  Promotion,
  Picture,
  Document,
  Loading,
  FolderOpened,
  Switch,
  ArrowDown,
  Search
} from '@element-plus/icons-vue'
import PromptTemplates from '@/components/PromptTemplates.vue'
import FileCenter from '@/components/FileCenter.vue'
import { sendChat } from '@/api/chat'

const selectedModel = ref('gpt-4')
const inputMessage = ref('')
const isLoading = ref(false)
const messages = ref([])
const chatContainer = ref(null)
const showPromptTemplates = ref(false)
const showFileCenter = ref(false)
const modelPickerVisible = ref(false)
const modelSearch = ref('')
const modelTab = ref('domestic')

const domesticModels = [
  { id: 'dify-deepseek-v3', name: 'DeepSeek V3.1', tag: 'Dify', tagType: 'success' },
  { id: 'dify-deepseek-terminus', name: 'DeepSeek V3.1 Terminus', tag: 'Dify', tagType: 'success' },
  { id: 'dify-qwen3', name: 'Qwen3 Next 80B', tag: 'Dify', tagType: 'success' },
  { id: 'dify-doubao', name: 'Doubao Seed 1.8', tag: 'Dify', tagType: 'success' },
  { id: 'dify-kimi-k25', name: 'Kimi K2.5', tag: 'Dify', tagType: 'success' },
  { id: 'dify-glm47', name: 'GLM 4.7', tag: 'Dify', tagType: 'success' },
  { id: 'kimi', name: 'Kimi', tag: '中文好', tagType: 'info' },
  { id: 'wenxin', name: '文心一言', tag: '逻辑强', tagType: 'info' },
  { id: 'deepseek', name: 'DeepSeek', tag: '性价比', tagType: 'info' }
]

const foreignModels = [
  { id: 'gpt-4', name: 'GPT-4', tag: '逻辑强', tagType: 'primary' },
  { id: 'claude-3', name: 'Claude 3', tag: '分析强', tagType: 'primary' }
]

const difyModels = [
  { id: 'dify', name: 'Dify Agent', tag: '默认', tagType: 'success' }
]

const pengbaoModels = [
  { id: 'pengbao-sft', name: '鹏宝SFT模型', tag: '三星专属', tagType: 'warning' }
]

const selectedModelName = computed(() => {
  const allModels = [...domesticModels, ...foreignModels, ...difyModels, ...pengbaoModels]
  const model = allModels.find(m => m.id === selectedModel.value)
  return model?.name || 'AI助手'
})

const getModelName = (modelId) => {
  if (!modelId) return 'AI助手'
  const allModels = [...domesticModels, ...foreignModels, ...difyModels, ...pengbaoModels]
  const model = allModels.find(m => m.id === modelId)
  return model?.name || modelId
}

const modelIconMap = {
  'gpt-4': '🌐',
  'claude-3': '🤖',
  kimi: '🤝',
  wenxin: '🧠',
  deepseek: '🧭',
  'dify': '🧩',
  'dify-deepseek-v3': '🧭',
  'dify-deepseek-terminus': '🧭',
  'dify-qwen3': '📘',
  'dify-doubao': '📄',
  'dify-kimi-k25': '🤝',
  'dify-glm47': '🛠️',
  'pengbao-sft': '⭐'
}
const getModelIcon = (modelId) => modelIconMap[modelId] || '🤖'

const sanitizeAIContent = (text) => {
  if (!text) return ''
  let t = text
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, '')
  t = t.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
  t = t.replace(/【思考过程】[\s\S]*?(?=\n\n|$)/gi, '[已隐藏思考过程]')
  t = t.trim()
  return t || '[已隐藏思考内容]'
}

const quickPrompts = [
  '帮我写一份产品介绍',
  '分析这个数据的趋势',
  '生成营销文案',
  '翻译这段文字'
]

const BACKEND_SUPPORTED_MODELS = [
  'gpt-4', 'kimi', 'claude-3', 'deepseek',
  'dify',
  'dify-deepseek-v3', 'dify-deepseek-terminus', 'dify-qwen3',
  'dify-doubao', 'dify-kimi-k25', 'dify-glm47'
]

// Dify conversation_id 按模型分开存
const difyConversationIds = ref({})

// 历史记录
const STORAGE_KEY = 'pengbao-chat-history'
const conversations = ref({})
const historySearch = ref('')

const saveHistory = () => {
  const payload = {
    conversations: conversations.value,
    difyConversationIds: difyConversationIds.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    conversations.value = parsed.conversations || {}
    difyConversationIds.value = parsed.difyConversationIds || {}
    if (conversations.value[selectedModel.value]) {
      messages.value = conversations.value[selectedModel.value]
    }
  } catch (e) {
    console.error('加载历史记录失败', e)
  }
}

const historyList = computed(() => {
  const items = Object.entries(conversations.value).map(([model, msgs]) => {
    const title = msgs[0]?.content?.slice(0, 18) || getModelName(model)
    return {
      id: model,
      model,
      count: msgs.length,
      title
    }
  })
  // 确保当前模型在列表中
  if (!items.find(i => i.model === selectedModel.value)) {
    items.unshift({
      id: selectedModel.value,
      model: selectedModel.value,
      count: messages.value.length,
      title: messages.value[0]?.content?.slice(0, 18) || getModelName(selectedModel.value)
    })
  }
  return items
})

const filteredHistories = computed(() => {
  const kw = historySearch.value.trim().toLowerCase()
  if (!kw) return historyList.value
  return historyList.value.filter(i =>
    i.title.toLowerCase().includes(kw) ||
    getModelName(i.model).toLowerCase().includes(kw) ||
    i.model.toLowerCase().includes(kw)
  )
})

const filterModels = (list) => {
  const kw = modelSearch.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter(m =>
    m.name.toLowerCase().includes(kw) ||
    (m.tag || '').toLowerCase().includes(kw) ||
    m.id.toLowerCase().includes(kw)
  )
}

const filteredModels = computed(() => ({
  domestic: filterModels(domesticModels),
  foreign: filterModels(foreignModels),
  dify: filterModels(difyModels),
  pengbao: filterModels(pengbaoModels)
}))

const startNewChat = () => {
  // 保存当前模型
  conversations.value[selectedModel.value] = [...messages.value]
  messages.value = []
  saveHistory()
}

const switchHistory = (item) => {
  conversations.value[selectedModel.value] = [...messages.value]
  selectedModel.value = item.model
  messages.value = conversations.value[item.model] || []
  saveHistory()
}

const handleModelChange = (newModel = selectedModel.value) => {
  conversations.value[selectedModel.value] = [...messages.value]
  saveHistory()
  selectedModel.value = newModel
  messages.value = conversations.value[newModel] || []
  saveHistory()
}

const selectModel = (modelId) => {
  handleModelChange(modelId)
  ElMessage.success(`已切换到 ${getModelName(modelId)}`)
  modelPickerVisible.value = false
  modelSearch.value = ''
}

const insertPrompt = (prompt) => {
  inputMessage.value = prompt
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    role: 'user',
    content: inputMessage.value,
    time: new Date().toLocaleTimeString(),
    avatar: ''
  }

  messages.value.push(userMessage)
  conversations.value[selectedModel.value] = [...messages.value]
  saveHistory()
  const currentInput = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  const modelId = selectedModel.value

  if (!BACKEND_SUPPORTED_MODELS.includes(modelId)) {
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: generateMockResponse(currentInput),
        time: new Date().toLocaleTimeString(),
        avatar: '',
        model: modelId
      }
      messages.value.push(aiMessage)
      isLoading.value = false
      nextTick(() => scrollToBottom())
    }, 800)
    return
  }

  try {
    const messagesForApi = messages.value
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }))
    const isDifyModel = modelId.startsWith('dify')
    const conversationId = isDifyModel ? (difyConversationIds.value[modelId] || null) : null
    const data = await sendChat(modelId, messagesForApi, 2000, conversationId)
    if (isDifyModel && data.conversation_id) {
      difyConversationIds.value[modelId] = data.conversation_id
    }
    const safeContent = sanitizeAIContent(data.content)
    const aiMessage = {
      role: 'assistant',
      content: safeContent,
      time: new Date().toLocaleTimeString(),
      avatar: '',
      model: modelId
    }
    messages.value.push(aiMessage)
    conversations.value[modelId] = [...messages.value]
    saveHistory()
  } catch (err) {
    const msg = err.response?.data?.error || err.message || '请求失败'
    ElMessage.error(msg)
    messages.value.pop()
    inputMessage.value = currentInput
  } finally {
    isLoading.value = false
    nextTick(() => scrollToBottom())
  }
}

const generateMockResponse = (input) => {
  return `针对您的问题"${input}"，我的回答是：\n\n这是一个示例回答。在实际应用中，这里会显示AI模型的真实响应内容。`
}

const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const regenerateMessage = (index) => {
  ElMessage.info('正在重新生成...')
}

const copyMessage = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const saveAsAgent = (message) => {
  ElMessage.info('保存为Agent功能开发中...')
}

const feedbackMessage = (index, type) => {
  ElMessage.success(type === 'like' ? '感谢您的反馈！' : '已记录您的反馈')
}

const handlePromptSelect = (prompt) => {
  inputMessage.value = prompt
  showPromptTemplates.value = false
}

const handleImageUpload = () => {
  ElMessage.info('图片上传功能开发中...')
}

const handleFileUpload = () => {
  ElMessage.info('文件上传功能开发中...')
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.chat-layout {
  display: flex;
  height: 100vh;
  background: #F5F7FB;
}

.history-panel {
  width: 260px;
  border-right: 1px solid #E5E7EB;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.history-search {
  margin-bottom: 4px;
}

.history-list {
  flex: 1;
  overflow: auto;
}

.history-item {
  display: flex;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
  &:hover {
    background: #F3F4F6;
  }
  &.active {
    background: #E5F1FF;
    border: 1px solid #BFDBFE;
  }
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #EEF2F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.history-text {
  flex: 1;
  min-width: 0;
  .history-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .history-meta {
    font-size: 12px;
    color: #6B7280;
  }
}

.history-empty {
  padding: 16px;
  text-align: center;
  color: #9CA3AF;
  font-size: 13px;
}

.chat-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  background: #F9FAFB;
}

.chat-header {
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.model-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #d0d7e2;
  background: #f7f9fc;
  color: #111827;
  .model-picker-icon {
    font-size: 18px;
  }
  .model-picker-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
    .label {
      font-size: 12px;
      color: #6B7280;
    }
    .name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
  }
  .model-picker-arrow {
    margin-left: 4px;
    color: #6B7280;
  }
}

.model-picker-dialog {
  .model-picker-search {
    margin-bottom: 16px;
  }
  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  .model-card {
    cursor: pointer;
    border: 1px solid #E5E7EB;
    .model-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      .model-icon {
        font-size: 18px;
      }
      .model-name {
        flex: 1;
        color: #111827;
      }
    }
  }
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 18px 24px;
}

.messages {
  max-width: 900px;
  margin: 0 auto;
}

.message-item {
  margin-bottom: 20px;
  animation: fadeIn 0.3s;

  &.user-message .message-content {
    background: #1428A0;
    color: white;
    margin-left: auto;
    max-width: 80%;
  }

  &.ai-message .message-content {
    background: white;
    border: 1px solid #E5E7EB;
    max-width: 80%;
  }
}

.message-content {
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .message-role {
    font-weight: 500;
    font-size: 14px;
  }

  .message-time {
    margin-left: auto;
    font-size: 12px;
    opacity: 0.7;
  }
}

.message-text {
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chat-input-area {
  padding: 14px 20px;
  background: white;
  border-top: 1px solid #E5E7EB;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);

  .input-toolbar {
    margin-bottom: 8px;
    display: flex;
    gap: 8px;
  }

  .input-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-end;

    .message-input {
      flex: 1;
    }

    .send-btn {
      height: 40px;
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .empty-content {
    text-align: center;
    color: #6B7280;

    h3 {
      margin: 16px 0 8px;
      color: #111827;
      font-size: 20px;
    }

    p {
      margin-bottom: 24px;
      color: #6B7280;
    }

    .quick-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      max-width: 600px;

      .prompt-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #1428A0;
          color: white;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
