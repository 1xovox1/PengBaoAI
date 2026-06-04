<template>
  <div class="vision-page">
    <header class="vision-header">
      <h1>视觉创作</h1>
      <p class="subtitle">用自然语言创作图片和视频</p>
    </header>

    <main class="vision-main">
      <!-- 左侧预览区 -->
      <section class="vision-preview">
        <div v-if="results.length === 0" class="preview-empty">
          <el-icon :size="40" color="#9CA3AF"><Picture /></el-icon>
          <h3>还没有作品</h3>
          <p>在右侧描述你想要的画面或视频，我们为你生成。</p>
        </div>
        <div v-else class="preview-list">
          <div
            v-for="item in results"
            :key="item.id"
            class="preview-item"
          >
            <div class="preview-meta">
              <span class="badge" :class="item.mode === 'image' ? 'badge-image' : 'badge-video'">
                {{ item.mode === 'image' ? '图片' : '视频' }}
              </span>
              <span class="meta-text">{{ item.modelLabel }} · {{ item.ratioLabel }}</span>
              <span class="meta-time">{{ item.time }}</span>
            </div>
            <div class="preview-box">
              <div class="preview-thumb" :class="item.mode">
                <span v-if="item.mode === 'image'">图片预览</span>
                <span v-else>视频预览</span>
              </div>
              <div class="preview-prompt">
                {{ item.prompt }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧对话式创作区 -->
      <section class="vision-composer">
        <el-tabs v-model="mode" class="mode-tabs">
          <el-tab-pane label="图片生成" name="image" />
          <el-tab-pane label="视频生成" name="video" />
        </el-tabs>

        <div class="composer-card">
          <div class="composer-header">
            <div class="model-pill">
              <span class="icon">{{ currentModel.icon }}</span>
              <span class="text">{{ currentModel.label }}</span>
            </div>
          </div>

          <div class="composer-body">
            <el-input
              v-model="prompt"
              type="textarea"
              :rows="5"
              class="prompt-input"
              :placeholder="mode === 'image'
                ? '描述你想要的图片，比如：夕阳下的城市天际线，赛博朋克风格，霓虹灯…'
                : '描述你想要的视频，比如：10秒城市延时摄影，夜晚车流光轨，从远景慢慢推近…'"
              @keydown.ctrl.enter="handleGenerate"
              @keydown.meta.enter="handleGenerate"
            />
          </div>

          <div class="composer-footer">
            <div class="controls-left">
              <el-select v-model="selectedModel" size="small" class="control-select">
                <el-option-group label="图像模型">
                  <el-option
                    v-for="m in imageModels"
                    :key="m.id"
                    :label="m.label"
                    :value="m.id"
                  />
                </el-option-group>
                <el-option-group label="视频模型">
                  <el-option
                    v-for="m in videoModels"
                    :key="m.id"
                    :label="m.label"
                    :value="m.id"
                  />
                </el-option-group>
              </el-select>

              <el-select v-model="ratio" size="small" class="control-select">
                <el-option
                  v-for="r in ratios"
                  :key="r.value"
                  :label="r.label"
                  :value="r.value"
                />
              </el-select>

              <el-select
                v-if="mode === 'image'"
                v-model="count"
                size="small"
                class="control-select narrow"
              >
                <el-option label="1 张" :value="1" />
                <el-option label="2 张" :value="2" />
                <el-option label="4 张" :value="4" />
              </el-select>

              <el-select
                v-else
                v-model="duration"
                size="small"
                class="control-select narrow"
              >
                <el-option label="5 秒" :value="5" />
                <el-option label="10 秒" :value="10" />
                <el-option label="15 秒" :value="15" />
              </el-select>
            </div>

            <div class="controls-right">
              <el-button
                type="primary"
                :loading="generating"
                :disabled="!prompt.trim()"
                @click="handleGenerate"
              >
                <el-icon><Promotion /></el-icon>
                <span style="margin-left: 4px;">
                  {{ generating ? '生成中...' : mode === 'image' ? '生成图片' : '生成视频' }}
                </span>
              </el-button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Promotion } from '@element-plus/icons-vue'

const mode = ref('image')
const prompt = ref('')
const selectedModel = ref('seedream-4_5')
const ratio = ref('4:3')
const count = ref(1)
const duration = ref(5)
const generating = ref(false)
const results = ref([])

const imageModels = [
  { id: 'seedream-4_5', label: 'Seedream 4.5' },
  { id: 'sd-xl', label: 'Stable Diffusion XL' }
]

const videoModels = [
  { id: 'video-gen-1', label: 'VideoGen 1.0' },
  { id: 'sora-style', label: 'Sora 风格' }
]

const ratios = [
  { value: '1:1', label: '1:1 正方形' },
  { value: '4:3', label: '4:3 横版' },
  { value: '16:9', label: '16:9 宽屏' },
  { value: '9:16', label: '9:16 竖屏' }
]

const currentModel = computed(() => {
  const list = mode.value === 'image' ? imageModels : videoModels
  const found = list.find(m => m.id === selectedModel.value) || list[0]
  return {
    label: found.label,
    icon: mode.value === 'image' ? '🖼️' : '🎬'
  }
})

const ratioLabel = computed(() => {
  const r = ratios.find(r => r.value === ratio.value)
  return r?.label || ratio.value
})

const handleGenerate = async () => {
  if (!prompt.value.trim() || generating.value) return
  generating.value = true

  try {
    // 这里先用前端模拟，后续再接图片/视频 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    const now = new Date().toLocaleTimeString()
    results.value.unshift({
      id: Date.now(),
      mode: mode.value,
      prompt: prompt.value.trim(),
      modelLabel: currentModel.value.label,
      ratioLabel: ratioLabel.value || ratio.value,
      time: now
    })
    ElMessage.success(mode.value === 'image' ? '已生成图片（示例）' : '已生成视频（示例）')
  } catch (e) {
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped lang="scss">
.vision-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: radial-gradient(120% 120% at 50% 10%, #FFFFFF 0%, #F3F4F6 60%, #E5E7EB 100%);
}

.vision-header {
  text-align: center;
  padding: 32px 24px 12px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #6B7280;
    font-size: 14px;
  }
}

.vision-main {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.2fr);
  gap: 24px;
  padding: 12px 32px 24px;
}

.vision-preview {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.preview-empty {
  flex: 1;
  border-radius: 20px;
  background: white;
  border: 1px dashed #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6B7280;

  h3 {
    font-size: 18px;
    color: #111827;
  }
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.preview-item {
  background: white;
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
  padding: 14px 16px 16px;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #6B7280;

  .meta-text {
    flex: 1;
  }

  .meta-time {
    color: #9CA3AF;
  }
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
}
.badge-image {
  background: #DBEAFE;
  color: #1D4ED8;
}
.badge-video {
  background: #FEE2E2;
  color: #B91C1C;
}

.preview-box {
  display: flex;
  gap: 12px;
}

.preview-thumb {
  width: 120px;
  height: 90px;
  border-radius: 12px;
  background: linear-gradient(135deg, #BFDBFE, #E5E7EB);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #1F2937;

  &.video {
    background: linear-gradient(135deg, #FECACA, #FDE68A);
  }
}

.preview-prompt {
  flex: 1;
  font-size: 13px;
  color: #111827;
  line-height: 1.6;
}

.vision-composer {
  display: flex;
  flex-direction: column;
}

.mode-tabs {
  margin-bottom: 8px;
}

.composer-card {
  background: white;
  border-radius: 22px;
  padding: 16px 18px 14px;
  box-shadow: 0 16px 50px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #EFF6FF;
  font-size: 12px;
  color: #1D4ED8;
  .icon {
    font-size: 14px;
  }
}

.prompt-input :deep(textarea) {
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.controls-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-select {
  min-width: 140px;

  &.narrow {
    min-width: 90px;
  }
}

.controls-right {
  display: flex;
  align-items: center;
}

@media (max-width: 1100px) {
  .vision-main {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
