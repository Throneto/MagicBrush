<template>
  <!-- 历史记录卡片 -->
  <div class="gallery-card">
    <!-- 封面区域 -->
    <div class="card-cover" @click="$emit('preview', record.id)">
      <img
        v-if="record.thumbnail && record.task_id"
        :src="`/api/images/${record.task_id}/${record.thumbnail}`"
        alt="cover"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="cover-placeholder">
        <span>{{ record.title.charAt(0) }}</span>
      </div>

      <!-- 悬浮操作按钮 -->
      <div class="card-overlay">
        <button class="overlay-btn" @click.stop="$emit('preview', record.id)">
          预览
        </button>
        <button class="overlay-btn primary" @click.stop="$emit('edit', record.id)">
          编辑
        </button>
      </div>

      <!-- 状态标识 -->
      <div class="status-badge" :class="record.status">
        {{ statusText }}
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="card-footer">
      <div class="card-title" :title="record.title">{{ record.title }}</div>
      <div class="card-meta">
        <span>{{ record.page_count }}P</span>
        <span class="dot">·</span>
        <span>{{ formattedDate }}</span>

        <div class="more-actions-wrapper">
          <button class="more-btn" @click.stop="$emit('delete', record)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 历史记录卡片组件
 *
 * 展示单个历史记录的封面、标题、状态等信息
 * 支持预览、编辑、删除操作
 */

// 定义记录类型
interface HistoryItem {
  id: string
  title: string
  status: 'draft' | 'completed' | 'generating'
  page_count: number
  updated_at: string
  thumbnail?: string
  task_id?: string
}

// 定义 Props
const props = defineProps<{
  record: HistoryItem
}>()

// 定义 Emits
defineEmits<{
  (e: 'preview', id: string): void
  (e: 'edit', id: string): void
  (e: 'delete', record: HistoryItem): void
}>()

/**
 * 获取状态文本
 */
const statusText = computed(() => {
  const map: Record<string, string> = {
    draft: '草稿',
    completed: '已完成',
    generating: '生成中'
  }
  return map[props.record.status] || props.record.status
})

/**
 * 格式化日期
 */
const formattedDate = computed(() => {
  const d = new Date(props.record.updated_at)
  return `${d.getMonth() + 1}/${d.getDate()}`
})
</script>

<style scoped>
/* 卡片容器 */
.gallery-card {
  background: rgba(12, 14, 20, 0.4);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  will-change: transform;
  contain: layout style paint;
  backdrop-filter: blur(5px);
}

.gallery-card:hover {
  transform: translateY(-8px) translateZ(0);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  background: rgba(12, 14, 20, 0.6);
  border-color: rgba(211, 166, 37, 0.3);
}

/* 封面区域 */
.card-cover {
  aspect-ratio: 3/4;
  background: #000;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  backface-visibility: hidden;
  opacity: 0.9;
}

.gallery-card:hover .card-cover img {
  transform: scale(1.1) translateZ(0);
  opacity: 1;
}

/* 封面占位符 */
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: rgba(255, 255, 255, 0.1);
  font-weight: 800;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  font-family: var(--font-heading);
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

/* 悬浮遮罩层 */
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(12, 14, 20, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  pointer-events: none;
  will-change: opacity;
}

.gallery-card:hover .card-overlay {
  opacity: 1;
  pointer-events: auto;
}

/* 遮罩层按钮 */
.overlay-btn {
  padding: 10px 28px;
  border-radius: 100px;
  border: 1px solid rgba(211, 166, 37, 0.4);
  background: rgba(12, 14, 20, 0.8);
  color: var(--primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  font-family: var(--font-heading);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.overlay-btn:hover {
  background: var(--primary);
  color: #000;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(211, 166, 37, 0.3);
  border-color: var(--primary);
}

.overlay-btn.primary {
  background: var(--primary);
  color: #000;
  border-color: var(--primary);
}

.overlay-btn.primary:hover {
  background: #fff;
  border-color: #fff;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.4);
}

/* 状态标识 */
.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(12, 14, 20, 0.85);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.status-badge.completed {
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.3);
}

.status-badge.draft {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.3);
}

.status-badge.generating {
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

/* 底部区域 */
.card-footer {
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
  font-family: var(--font-heading);
  letter-spacing: 0.3px;
}

.card-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-sub);
}

.dot {
  margin: 0 8px;
  color: var(--text-placeholder);
}

/* 更多操作 */
.more-actions-wrapper {
  margin-left: auto;
}

.more-btn {
  background: none;
  border: none;
  color: var(--text-placeholder);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}
</style>
