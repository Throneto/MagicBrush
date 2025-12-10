<template>
  <!-- 统计概览卡片 -->
  <div class="stats-overview" v-if="stats">
    <div class="stat-box">
      <div class="stat-icon-circle blue">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
      <div class="stat-content">
        <h4>总作品数</h4>
        <div class="number">{{ stats.total || 0 }}</div>
      </div>
    </div>

    <div class="stat-box">
      <div class="stat-icon-circle green">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="stat-content">
        <h4>已完成</h4>
        <div class="number">{{ stats.by_status?.completed || 0 }}</div>
      </div>
    </div>

    <div class="stat-box">
      <div class="stat-icon-circle orange">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>
      <div class="stat-content">
        <h4>草稿箱</h4>
        <div class="number">{{ stats.by_status?.draft || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 历史记录统计概览组件
 *
 * 显示三个统计卡片：
 * - 总作品数
 * - 已完成数量
 * - 草稿箱数量
 */

// 定义 Props
interface Stats {
  total?: number
  by_status?: {
    completed?: number
    draft?: number
    generating?: number
  }
}

defineProps<{
  stats: Stats | null
}>()
</script>

<style scoped>
/* 统计概览容器 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* 单个统计卡片 */
.stat-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: rgba(12, 14, 20, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-box:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-4px);
  border-color: rgba(211, 166, 37, 0.3);
  background: rgba(12, 14, 20, 0.8);
}

/* 图标圆圈 */
.stat-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-icon-circle.blue {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-icon-circle.green {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.stat-icon-circle.orange {
  background: rgba(249, 115, 22, 0.1);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* 统计内容 */
.stat-content h4 {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub);
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
}

.stat-content .number {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  font-family: var(--font-heading);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-box {
    padding: 20px;
  }

  .stat-content .number {
    font-size: 28px;
  }
}
</style>
