<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1 class="page-title">生成结果</h1>
        <p class="page-subtitle">
          <span v-if="store.waitingApproval">请确认封面风格满意后，继续生成后续内容</span>
          <span v-else-if="isGenerating">正在生成第 {{ store.progress.current + 1 }} / {{ store.progress.total }} 页</span>
          <span v-else-if="hasFailedImages">{{ failedCount }} 张图片生成失败，可点击重试</span>
          <span v-else>全部 {{ store.progress.total }} 张图片生成完成</span>
        </p>
      </div>
      <div style="display: flex; gap: 10px;">
        <!-- 暂停/继续/取消按钮 -->
        <button
          v-if="isGenerating"
          class="btn btn-secondary"
          @click="handlePause"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          暂停
        </button>
        <button
          v-if="store.isPaused"
          class="btn btn-primary"
          @click="handleResume"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          继续生成
        </button>
        <button
          v-if="isGenerating || store.isPaused"
          class="btn btn-danger"
          @click="handleCancel"
          style="background-color: #fff1f0; color: #ff4d4f; border: 1px solid #ffccc7;"
        >
          取消
        </button>

        <button
          v-if="hasFailedImages && !isGenerating && !store.waitingApproval && !store.isPaused"
          class="btn btn-primary"
          @click="retryAllFailed"
          :disabled="isRetrying"
        >
          {{ isRetrying ? '补全中...' : '一键补全失败图片' }}
        </button>
        <button class="btn" @click="router.push('/outline')" style="border:1px solid var(--border-color)">
          返回大纲
        </button>
      </div>
    </div>
    
    <!-- 超时提示 -->
    <div v-if="isTimeout" class="timeout-alert">
      <div class="alert-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>生成过程似乎卡住了（已超时），建议暂停后重试或检查网络。</span>
      </div>
      <button class="btn-text" @click="handlePause">立即暂停</button>
    </div>

    <!-- 审批模式：大封面预览 -->
    <div v-if="store.waitingApproval" class="approval-container">
       <!-- 错误提示 -->
       <div v-if="error" class="error-toast" @click="error = ''">
          {{ error }}
       </div>

       <div class="card approval-card">
          <div class="approval-preview">
             <img v-if="coverImage && coverImage.url" :src="coverImage.url" alt="封面预览" />
             <div v-else class="spinner-large">
                <div class="spinner"></div>
                <div class="loading-text">正在重绘中...</div>
             </div>
          </div>
          <div class="approval-actions">
             <h3>封面生成完成</h3>
              <p>这是整篇文章的视觉风格基准。如果满意，后续页面将保持此风格；如果不满意，请重新生成封面。</p>
              
              <!-- 修改指令输入框 -->
              <div class="modification-input" style="margin-bottom: 20px;">
                <textarea 
                  v-model="modificationPrompt" 
                  placeholder="对封面不满意？请输入修改指令，例如：换个背景颜色、人物再活泼一点..."
                  :disabled="isRetrying"
                  style="width: 100%; min-height: 80px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; resize: vertical;"
                ></textarea>
              </div>

              <div class="action-buttons">
                 <button class="btn btn-secondary" @click="regenerateCover" :disabled="isRetrying">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                   {{ isRetrying ? '重绘中...' : '根据指令重绘封面' }}
                 </button>
                 <button class="btn btn-primary" @click="continueGeneration">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   满意，生成剩余内容
                 </button>
              </div>
           </div>
       </div>
    </div>

    <!-- 正常网格模式 -->
    <div v-else class="card">
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">生成进度</span>
        <span style="color: var(--primary); font-weight: 600;">{{ Math.round(progressPercent) }}%</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
      </div>

      <div v-if="error" class="error-msg">
        {{ error }}
      </div>

      <div class="grid-cols-4" style="margin-top: 40px;">
        <div v-for="image in store.images" :key="image.index" class="image-card">
          <!-- 图片展示区域 -->
          <div v-if="image.url && image.status === 'done'" class="image-preview">
            <img :src="image.url" :alt="`第 ${image.index + 1} 页`" />
            <!-- 重新生成按钮（悬停显示） -->
            <div class="image-overlay">
              <button
                class="overlay-btn"
                @click="regenerateImage(image.index)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                重新生成
              </button>
            </div>
          </div>

          <!-- 生成中/重试中状态 -->
          <div v-else-if="image.status === 'generating' || image.status === 'retrying'" class="image-placeholder">
            <div class="spinner"></div>
            <div class="status-text">{{ image.status === 'retrying' ? '重试中...' : '生成中...' }}</div>
          </div>

          <!-- 失败状态 -->
          <div v-else-if="image.status === 'error'" class="image-placeholder error-placeholder">
            <div class="error-icon">!</div>
            <div class="status-text">生成失败</div>
            <button
              class="retry-btn"
              @click="retrySingleImage(image.index)"
              :disabled="isRetrying"
            >
              点击重试
            </button>
          </div>

          <!-- 等待中状态 -->
          <div v-else class="image-placeholder">
            <div class="status-text">等待中</div>
          </div>

          <!-- 底部信息栏 -->
          <div class="image-footer">
            <span class="page-label">Page {{ image.index + 1 }}</span>
            <span class="status-badge" :class="image.status">
              {{ getStatusText(image.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGeneratorStore } from '../stores/generator'
import { generateImagesPost, regenerateImage as apiRegenerateImage, retryFailedImages as apiRetryFailed, createHistory, updateHistory } from '../api'

const router = useRouter()
const store = useGeneratorStore()

const error = ref('')
const isRetrying = ref(false)
const modificationPrompt = ref('') // 新增：修改指令
const abortController = ref<AbortController | null>(null)
const timeoutTimer = ref<ReturnType<typeof setInterval> | null>(null)
const TIMEOUT_MS = 180000 // 3分钟超时
const isTimeout = ref(false)

const isGenerating = computed(() => store.progress.status === 'generating')

const progressPercent = computed(() => {
  if (store.progress.total === 0) return 0
  return (store.progress.current / store.progress.total) * 100
})

const hasFailedImages = computed(() => store.images.some(img => img.status === 'error'))

const failedCount = computed(() => store.images.filter(img => img.status === 'error').length)

const coverImage = computed(() => {
  const coverPage = store.outline.pages.find(p => p.type === 'cover') || store.outline.pages[0]
  if (!coverPage) return undefined
  return store.images.find(img => img.index === coverPage.index)
})

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    generating: '生成中',
    done: '已完成',
    error: '失败',
    retrying: '重试中'
  }
  return texts[status] || '等待中'
}

// 重试单张图片（异步并发执行，不阻塞）
function retrySingleImage(index: number) {
  if (!store.taskId) return

  const page = store.outline.pages.find(p => p.index === index)
  if (!page) return

  // 立即设置为重试状态
  store.setImageRetrying(index)

  // 构建上下文信息
  const context = {
    fullOutline: store.outline.raw || '',
    userTopic: store.topic || ''
  }

  // 异步执行重绘，不阻塞
  apiRegenerateImage(store.taskId, page, true, context)
    .then(result => {
      if (result.success && result.image_url) {
        store.updateImage(index, result.image_url)
      } else {
        store.updateProgress(index, 'error', undefined, result.error)
      }
    })
    .catch(e => {
      store.updateProgress(index, 'error', undefined, String(e))
    })
}

// 重新生成图片（成功的也可以重新生成，立即返回不等待）
function regenerateImage(index: number) {
  retrySingleImage(index)
}

// 重绘封面（在审批阶段）
async function regenerateCover() {
  console.log('[Frontend] regenerateCover triggered')
  isRetrying.value = true
  error.value = '' // 清除之前的错误
  
  try {
     if (!store.taskId) {
         console.error('[Frontend] Missing taskId')
         error.value = '系统异常：缺少任务ID'
         return
     }

     // 动态查找封面页（优先 type='cover'）
     const page = store.outline.pages.find(p => p.type === 'cover') || store.outline.pages[0]
     if (!page) {
         console.error('[Frontend] Cover page not found')
         error.value = '系统异常：未找到封面页面'
         return
     }
     
     console.log('[Frontend] Regenerating cover for page:', page.index, 'Prompt:', modificationPrompt.value)

     // 清除旧的封面URL以显示加载状态
     const coverImg = store.images.find(img => img.index === page.index)
     if(coverImg) {
        console.log('[Frontend] Clearing old cover URL locally')
        coverImg.url = ''
     } else {
        console.warn('[Frontend] Cover image state not found locally')
     }

     const result = await apiRegenerateImage(store.taskId, page, true, {
        fullOutline: store.outline.raw || '',
        userTopic: store.topic || '',
        customPrompt: modificationPrompt.value // 传入自定义修改指令
     })

     console.log('[Frontend] API Result:', result)

     if (result.success && result.image_url) {
        store.updateImage(page.index, result.image_url)
        modificationPrompt.value = '' // 清空输入框
     } else {
         error.value = result.error || '封面重绘失败'
         console.error('[Frontend] Regeneration failed:', result.error)
     }
  } catch (e) {
      console.error('[Frontend] Exception in regenerateCover:', e)
      error.value = '封面重绘异常: ' + String(e)
  } finally {
      isRetrying.value = false
  }
}

// 继续生成剩余内容
function continueGeneration() {
  store.waitingApproval = false
  
  // 发起第二阶段请求：生成 content
  runGeneration('content')
}

// 暂停生成
function handlePause() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  if (timeoutTimer.value) {
    clearInterval(timeoutTimer.value)
    timeoutTimer.value = null
  }
  store.pauseGeneration()
  isTimeout.value = false // 清除超时标记
}

// 取消生成
function handleCancel() {
  if (confirm('确定要取消生成任务吗？')) {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    if (timeoutTimer.value) {
      clearInterval(timeoutTimer.value)
      timeoutTimer.value = null
    }
    store.cancelGeneration()
    isTimeout.value = false
  }
}

// 恢复生成
function handleResume() {
  store.resumeGeneration()
  // 恢复时，根据当前情况决定策略
  // 如果是在 approval 之前暂停的，或者 content 阶段
  // 直接重新调用 runGeneration 传入 'all' (或者根据 store 状态智能判断)
  // generator store 里其实不区分 step，只看 images 状态
  // 简单的做法是：再次调用 runGeneration，后端会跳过已完成的 (API 虽无此显式功能，但 store 状态在)
  // 实际上 api 层的 generateImagesPost 接收的是 pages 列表。
  // 我们应该只传未完成的 pages？不，API 设计是传 pages，后端处理。
  // 但 generateImagesPost 是新开请求。
  
  // 简单策略：如果 waitingApproval，说明在第一阶段。否则可能在第二阶段。
  // 如果封面好了但没点满意，resume 应该什么都不做？或者 resume 应该继续生成封面？
  // 如果是生成内容阶段。
  
  // 这里简化处理：直接调 runGeneration('all')，依赖后端/前端去重逻辑
  // 现有的 generateImagesPost 是流式的，会覆盖状态。
  // 我们修改 runGeneration 逻辑，只重新请求生成的。
  
  // 更好的方式：runGeneration 内部逻辑保持不变，它会重新提交所有 pages。
  // 后端 generators/image_api.py 并没有检查 "已存在"，它会重新生成。
  // 这可能导致重复扣费或重复生成。
  
  // 改进：只筛选出未完成的 pages 传给后端？
  // generateImagesPost 的 pages 参数。
  // 我们可以过滤一下。
  
  if (store.waitingApproval) {
     // 如果在审批界面暂停，其实没什么可 Resume 的，除非是在 重绘封面 时暂停
     // 只是恢复 UI 状态
  } else {
     // 重新运行生成
     // 传递 abortSignal
     runGeneration(store.images.some(img => img.status === 'done') ? 'content' : 'all') 
     // 粗略判断：如果有完成的，可能是 content 阶段，或者是 all 阶段的一半
     // 安全起见传 all，但后端会重生成。
     // 这是一个优化点，但在"超时暂停"这个需求里，首要保证能动。
     // 考虑到"超时"通常是因为没反应，重试是合理的。
  }
}

// 检测超时
function checkTimeout() {
  if (!store.generationStartTime || !isGenerating.value) return
  
  const duration = Date.now() - store.generationStartTime
  if (duration > TIMEOUT_MS) {
     isTimeout.value = true
     // 可选：自动暂停
     // handlePause() 
     // error.value = '生成超时，已自动暂停'
  }
}

// 批量重试所有失败的图片
async function retryAllFailed() {
  if (!store.taskId) return

  const failedPages = store.getFailedPages()
  if (failedPages.length === 0) return

  isRetrying.value = true

  // 设置所有失败的图片为重试状态
  failedPages.forEach(page => {
    store.setImageRetrying(page.index)
  })
  
  // 重置开始时间用于超时
  // 虽然 retryAllFailed 没有接入 runGeneration 的 timer，但可以简单复用
  // 这里暂时不加 timer 给 retryAllFailed，因为它通常比较快或已经在 UI 有单独控制
  // 如果需要统一，也可以加。

  try {
    await apiRetryFailed(
      store.taskId,
      failedPages,
      // onProgress
      () => {},
      // onComplete
      (event) => {
        if (event.image_url) {
          store.updateImage(event.index, event.image_url)
        }
      },
      // onError
      (event) => {
        store.updateProgress(event.index, 'error', undefined, event.message)
      },
      // onFinish
      () => {
        isRetrying.value = false
      },
      // onStreamError
      (err) => {
        console.error('重试失败:', err)
        isRetrying.value = false
        error.value = '重试失败: ' + err.message
      }
    )
  } catch (e) {
    isRetrying.value = false
    error.value = '重试失败: ' + String(e)
  }
}

// 封装生成逻辑
function runGeneration(step: 'all' | 'cover' | 'content') {
  // 创建新的 AbortController
  if (abortController.value) {
    abortController.value.abort() // 取消之前的（如果有）
  }
  abortController.value = new AbortController()
  
  // 启动超时检测
  if (timeoutTimer.value) clearInterval(timeoutTimer.value)
  isTimeout.value = false
  timeoutTimer.value = setInterval(checkTimeout, 1000)

  generateImagesPost(
    store.outline.pages,
    store.taskId, // 复用 taskId
    store.outline.raw,
    // onProgress
    (event) => {
      // 处理 "waiting_approval" 特殊状态
      // @ts-ignore
      if (event.status === 'waiting_approval') {
          store.waitingApproval = true
          // 关键修复：确保保存 task_id，避免重绘时丢失
          // @ts-ignore
          if (event.task_id) {
             console.log('[Frontend] Received task_id from waiting_approval:', event.task_id)
             store.taskId = event.task_id
             store.saveToStorage()
          }
          return
      }

      console.log('Progress:', event)
    },
    // onComplete
    (event) => {
      console.log('Complete:', event)
      if (event.image_url) {
        store.updateProgress(event.index, 'done', event.image_url)
      }
    },
    // onError
    (event) => {
      console.error('Error:', event)
      store.updateProgress(event.index, 'error', undefined, event.message)
    },
    // onFinish
    async (event) => {
      console.log('Finish:', event)
      // 如果还在等待审批，不要结束任务
      if (store.waitingApproval) return
      
      store.finishGeneration(event.task_id)

      // 更新历史记录
      if (store.recordId) {
        try {
          // 收集所有生成的图片文件名
          const generatedImages = event.images.filter(img => img !== null)

          // 确定状态
          let status = 'completed'
          if (hasFailedImages.value) {
            status = generatedImages.length > 0 ? 'partial' : 'draft'
          }

          // 获取封面图作为缩略图（只保存文件名，不是完整URL）
          const thumbnail = generatedImages.length > 0 ? generatedImages[0] : null

          await updateHistory(store.recordId, {
            images: {
              task_id: event.task_id,
              generated: generatedImages
            },
            status: status,
            thumbnail: thumbnail
          })
          console.log('历史记录已更新')
        } catch (e) {
          console.error('更新历史记录失败:', e)
        }
      }

      // 如果没有失败的，跳转到结果页
      if (!hasFailedImages.value) {
        setTimeout(() => {
          router.push('/result')
        }, 1000)
      }
    },
    // onStreamError
    (err) => {
      console.error('Stream Error:', err)
      error.value = '生成失败: ' + err.message
    },
    // userImages
    store.userImages.length > 0 ? store.userImages : undefined,
    // userTopic
    store.topic || '',
    // step
    step,
    // style
    store.style,
    abortController.value.signal // 传入 signal
  ).finally(() => {
    // 清理资源
    if (timeoutTimer.value) {
      clearInterval(timeoutTimer.value)
      timeoutTimer.value = null
    }
    abortController.value = null
  })
}

onMounted(async () => {
  if (store.outline.pages.length === 0) {
    router.push('/')
    return
  }

  // 创建历史记录（如果还没有）
  if (!store.recordId) {
    try {
      const result = await createHistory(store.topic, {
        raw: store.outline.raw,
        pages: store.outline.pages
      })
      if (result.success && result.record_id) {
        store.recordId = result.record_id
        console.log('创建历史记录:', store.recordId)
      }
    } catch (e) {
      console.error('创建历史记录失败:', e)
    }
  }

  // 如果已经在生成中或有结果，不需要重新开始
  // 但如果 store 中没有 taskId，说明是刚刷新进来，需要重新开始
  if (!store.images.length || !store.taskId) {
      store.startGeneration()
      // 第一步：只生成封面
      runGeneration('cover')
  } else if (store.waitingApproval) {
      // 恢复等待状态（如果刷新）
      // 这里可能需要重新触发一次 cover 检查或者手动恢复 UI
      // 简化处理：直接显示
  }
})

onUnmounted(() => {
  if (timeoutTimer.value) {
    clearInterval(timeoutTimer.value)
  }
  if (abortController.value) {
    abortController.value.abort()
  }
})
</script>

<style scoped>
/* 审批模式样式 */
.approval-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.approval-card {
    display: flex;
    gap: 40px;
    padding: 30px;
    max-width: 900px;
    width: 100%;
    align-items: center;
}

.approval-preview {
    width: 320px;
    aspect-ratio: 3/4;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background: #f5f5f5;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.approval-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.approval-actions {
    flex: 1;
}

.approval-actions h3 {
    margin-top: 0;
    font-size: 24px;
    margin-bottom: 12px;
}

.approval-actions p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 30px;
}

.action-buttons {
    display: flex;
    gap: 16px;
}

.action-buttons .btn {
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
}


/* 原有样式保持不变 */
.container {
    padding-bottom: 60px;
}

.image-preview {
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
  flex: 1; /* 填充卡片剩余空间 */
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
}

.overlay-btn:hover {
  background: var(--primary);
  color: white;
}

.overlay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-placeholder {
  aspect-ratio: 3/4;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1; /* 填充卡片剩余空间 */
  min-height: 240px; /* 确保有最小高度 */
}

.error-placeholder {
  background: #fff5f5;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.status-text {
  font-size: 13px;
  color: var(--text-sub);
}

.retry-btn {
  margin-top: 8px;
  padding: 6px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.image-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-label {
  font-size: 12px;
  color: var(--text-sub);
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge.done {
  background: #E6F7ED;
  color: #52C41A;
}

.status-badge.generating,
.status-badge.retrying {
  background: #E6F4FF;
  color: #1890FF;
}

.status-badge.error {
  background: #FFF1F0;
  color: #FF4D4F;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header > div:last-child {
    width: 100%;
  }

  .page-header .btn {
    flex: 1;
  }

  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .approval-card {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }

  .approval-preview {
    width: 100%;
    max-width: 240px;
  }

  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }
}


.spinner-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.loading-text {
    font-size: 14px;
    color: var(--primary);
}

.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 77, 79, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { transform: translate(-50%, -100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

@media (max-width: 480px) {
  .grid-cols-4 {
    grid-template-columns: 1fr !important;
  }
}

.timeout-alert {
  margin-top: 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #d48806;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
  padding: 4px 8px;
}

.btn-text:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
}
</style>
