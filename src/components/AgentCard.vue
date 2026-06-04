<template>
  <div class="agent-card" @click="$emit('click')">
    <div class="card-header">
      <div class="agent-icon">
        <el-icon :size="32"><component :is="agent.icon" /></el-icon>
      </div>
      <div class="agent-info">
        <h3 class="agent-name">{{ agent.name }}</h3>
        <div class="agent-meta">
          <span class="usage-count">
            <el-icon><View /></el-icon>
            {{ agent.usageCount }}
          </span>
          <span class="rating">
            <el-icon><Star /></el-icon>
            {{ agent.rating }}
          </span>
        </div>
      </div>
      <el-button
        text
        :class="{ favorited: agent.isFavorite }"
        @click.stop="$emit('favorite')"
        class="favorite-btn"
      >
        <el-icon><component :is="agent.isFavorite ? StarFilled : Star" /></el-icon>
      </el-button>
    </div>

    <p class="agent-description">{{ agent.description }}</p>

    <div class="card-footer">
      <div class="agent-tags">
        <el-tag
          v-for="tag in agent.tags"
          :key="tag"
          size="small"
          :type="getTagType(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="agent-context">
        <div class="agent-department" v-if="agent.department">
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ agent.department }}</span>
        </div>
        <div class="agent-capability" v-if="agent.capability">
          <el-icon><MagicStick /></el-icon>
          <span>{{ agent.capability }}</span>
        </div>
      </div>
    </div>

    <div class="card-hover-effect"></div>
  </div>
</template>

<script setup>
import { Star, StarFilled, View, OfficeBuilding, MagicStick } from '@element-plus/icons-vue'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'favorite'])

const getTagType = (tag) => {
  const typeMap = {
    '热门': 'danger',
    '推荐': 'warning',
    '专业': 'success',
    '实用': 'info'
  }
  return typeMap[tag] || 'info'
}
</script>

<style scoped lang="scss">
.agent-card {
  position: relative;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;

  &:hover {
    border-color: #1428A0;
    box-shadow: 0 8px 24px rgba(20, 40, 160, 0.15);
    transform: translateY(-4px);

    .card-hover-effect {
      opacity: 1;
    }
  }

  .card-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1428A0, #1E40E6);
    opacity: 0;
    transition: opacity 0.3s;
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  .agent-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #1428A0, #1E40E6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .agent-info {
    flex: 1;
    min-width: 0;

    .agent-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .agent-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #6B7280;

      .usage-count,
      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .favorite-btn {
    color: #D1D5DB;
    font-size: 20px;
    flex-shrink: 0;

    &.favorited {
      color: #F59E0B;
    }

    &:hover {
      color: #F59E0B;
    }
  }
}

.agent-description {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;

  .agent-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .agent-context {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;

    .agent-department,
    .agent-capability {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #9CA3AF;
      line-height: 1.2;
    }
  }
}
</style>

