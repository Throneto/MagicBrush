<template>
  <!-- 服务商列表表格 -->
  <div class="provider-table">
    <div class="table-header">
      <div class="col-status">状态</div>
      <div class="col-name">名称</div>
      <div class="col-model">模型</div>
      <div class="col-apikey">API Key</div>
      <div class="col-actions">操作</div>
    </div>
    <div
      v-for="(provider, name) in providers"
      :key="name"
      class="table-row"
      :class="{ active: activeProvider === name }"
    >
      <div class="col-status">
        <button
          class="btn-activate"
          :class="{ active: activeProvider === name }"
          @click="$emit('activate', name)"
          :disabled="activeProvider === name"
        >
          {{ activeProvider === name ? '已激活' : '激活' }}
        </button>
      </div>
      <div class="col-name">
        <span class="provider-name">{{ name }}</span>
      </div>
      <div class="col-model">
        <span class="model-name">{{ provider.model }}</span>
      </div>
      <div class="col-apikey">
        <span class="apikey-masked" :class="{ empty: !provider.api_key_masked }">
          {{ provider.api_key_masked || '未配置' }}
        </span>
      </div>
      <div class="col-actions">
        <button class="btn-icon" @click="$emit('test', name, provider)" title="测试连接">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </button>
        <button class="btn-icon" @click="$emit('edit', name, provider)" title="编辑">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button
          class="btn-icon danger"
          @click="$emit('delete', name)"
          v-if="canDelete"
          title="删除"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 服务商列表表格组件
 *
 * 功能：
 * - 展示服务商列表
 * - 激活/编辑/删除/测试操作
 */

// 定义服务商类型
interface Provider {
  type: string
  model: string
  base_url?: string
  api_key?: string
  api_key_masked?: string
}

// 定义 Props
const props = defineProps<{
  providers: Record<string, Provider>
  activeProvider: string
}>()

// 定义 Emits
defineEmits<{
  (e: 'activate', name: string): void
  (e: 'edit', name: string, provider: Provider): void
  (e: 'delete', name: string): void
  (e: 'test', name: string, provider: Provider): void
}>()

// 是否可以删除（至少保留一个）
const canDelete = computed(() => Object.keys(props.providers).length > 1)
</script>

<style scoped>
/* 表格容器 */
.provider-table {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(12, 14, 20, 0.4);
  backdrop-filter: blur(5px);
}

/* 表头 */
.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1.5fr 120px;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
}

/* 表格行 */
.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1.5fr 120px;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;
  transition: all 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table-row.active {
  background: rgba(211, 166, 37, 0.05);
  border-bottom-color: rgba(211, 166, 37, 0.1);
}

/* 激活按钮 */
.btn-activate {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-activate:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(211, 166, 37, 0.1);
}

.btn-activate.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
  cursor: default;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
}

/* 服务商名称 */
.provider-name {
  font-weight: 600;
  color: var(--text-main);
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
}

/* 模型名称 */
.model-name {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  color: var(--text-sub);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* API Key 显示 */
.apikey-masked {
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', monospace;
  color: var(--text-placeholder);
  word-break: break-all;
}

.apikey-masked.empty {
  color: #f59e0b;
}

/* 操作列 */
.col-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 图标按钮 */
.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: rgba(211, 166, 37, 0.3);
  color: var(--primary);
  background: rgba(211, 166, 37, 0.1);
  transform: translateY(-2px);
}

.btn-icon.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 70px 1fr 100px;
    gap: 8px;
  }

  .col-model,
  .col-apikey {
    display: none;
  }
  
  .provider-table {
    border: none;
    background: transparent;
  }
  
  .table-row {
    background: rgba(12, 14, 20, 0.4);
    margin-bottom: 8px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .table-header {
    display: none;
  }
}
</style>
