import { defineStore } from 'pinia'
import type { Page } from '../api'

export interface GeneratedImage {
  index: number
  url: string
  status: 'generating' | 'done' | 'error' | 'retrying'
  error?: string
  retryable?: boolean
}

export interface GeneratorState {
  // 当前阶段
  stage: 'input' | 'outline' | 'generating' | 'result'

  // 用户输入
  topic: string

  // 风格
  style: string

  // 大纲数据
  outline: {
    raw: string
    pages: Page[]
  }

  // 生成进度
  progress: {
    current: number
    total: number
    status: 'idle' | 'generating' | 'done' | 'error' | 'paused' | 'cancelled'
  }

  // 生成结果
  images: GeneratedImage[]

  // 任务ID
  taskId: string | null

  // 历史记录ID
  recordId: string | null

  // 用户上传的图片（用于图片生成参考）
  userImages: File[]

  // 是否等待确认封面
  waitingApproval: boolean

  // 是否已暂停
  isPaused: boolean

  // 生成开始时间（用于超时检测）
  generationStartTime: number | null
}

const STORAGE_KEY = 'generator-state'

// 从 localStorage 加载状态
function loadState(): Partial<GeneratorState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载状态失败:', e)
  }
  return {}
}

// 保存状态到 localStorage
function saveState(state: GeneratorState) {
  try {
    // 只保存关键数据，不保存 userImages（文件对象无法序列化）
    const toSave = {
      stage: state.stage,
      topic: state.topic,
      style: state.style,
      outline: state.outline,
      progress: state.progress,
      images: state.images,
      taskId: state.taskId,
      recordId: state.recordId,
      waitingApproval: state.waitingApproval
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('保存状态失败:', e)
  }
}

export const useGeneratorStore = defineStore('generator', {
  state: (): GeneratorState => {
    const saved = loadState()
    return {
      stage: saved.stage || 'input',
      topic: saved.topic || '',
      style: saved.style || '小红书爆款图文风格',
      outline: saved.outline || {
        raw: '',
        pages: []
      },
      progress: saved.progress || {
        current: 0,
        total: 0,
        status: 'idle'
      },
      images: saved.images || [],
      taskId: saved.taskId || null,
      recordId: saved.recordId || null,
      userImages: [],  // 不从 localStorage 恢复
      waitingApproval: saved.waitingApproval || false,
      isPaused: false,
      generationStartTime: null
    }
  },

  actions: {
    // 设置主题
    setTopic(topic: string) {
      this.topic = topic
    },

    // 设置风格
    setStyle(style: string) {
      this.style = style
    },

    // 设置大纲
    setOutline(raw: string, pages: Page[]) {
      this.outline.raw = raw
      this.outline.pages = pages
      this.stage = 'outline'
    },

    // 更新页面
    updatePage(index: number, content: string) {
      const page = this.outline.pages.find(p => p.index === index)
      if (page) {
        page.content = content
        // 同步更新 raw 文本
        this.syncRawFromPages()
      }
    },

    // 根据 pages 重新生成 raw 文本
    syncRawFromPages() {
      this.outline.raw = this.outline.pages
        .map(page => page.content)
        .join('\n\n<page>\n\n')
    },

    // 删除页面
    deletePage(index: number) {
      this.outline.pages = this.outline.pages.filter(p => p.index !== index)
      // 重新索引
      this.outline.pages.forEach((page, idx) => {
        page.index = idx
      })
      // 同步更新 raw 文本
      this.syncRawFromPages()
    },

    // 添加页面
    addPage(type: 'cover' | 'content' | 'summary', content: string = '') {
      const newPage: Page = {
        index: this.outline.pages.length,
        type,
        content
      }
      this.outline.pages.push(newPage)
      // 同步更新 raw 文本
      this.syncRawFromPages()
    },

    // 插入页面
    insertPage(afterIndex: number, type: 'cover' | 'content' | 'summary', content: string = '') {
      const newPage: Page = {
        index: afterIndex + 1,
        type,
        content
      }
      this.outline.pages.splice(afterIndex + 1, 0, newPage)
      // 重新索引
      this.outline.pages.forEach((page, idx) => {
        page.index = idx
      })
      // 同步更新 raw 文本
      this.syncRawFromPages()
    },

    // 移动页面 (拖拽排序)
    movePage(fromIndex: number, toIndex: number) {
      const pages = [...this.outline.pages]
      const [movedPage] = pages.splice(fromIndex, 1)
      pages.splice(toIndex, 0, movedPage)

      // 重新索引
      pages.forEach((page, idx) => {
        page.index = idx
      })

      this.outline.pages = pages
      // 同步更新 raw 文本
      this.syncRawFromPages()
    },

    // 开始生成
    startGeneration() {
      this.stage = 'generating'
      this.taskId = null // 清除旧任务ID
      this.recordId = null // 清除旧记录ID
      this.waitingApproval = false // 重置审批状态
      this.isPaused = false // 重置暂停状态
      this.generationStartTime = Date.now() // 记录开始时间
      this.progress.current = 0
      this.progress.total = this.outline.pages.length
      this.progress.status = 'generating'
      this.images = this.outline.pages.map(page => ({
        index: page.index,
        url: '',
        status: 'generating'
      }))
    },

    // 更新进度
    updateProgress(index: number, status: 'generating' | 'done' | 'error', url?: string, error?: string) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        image.status = status
        if (url) image.url = url
        if (error) image.error = error
      }
      if (status === 'done') {
        this.progress.current++
      }
    },

    updateImage(index: number, newUrl: string) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        const timestamp = Date.now()
        image.url = `${newUrl}?t=${timestamp}`
        image.status = 'done'
        delete image.error
      }
    },

    // 完成生成
    finishGeneration(taskId: string) {
      this.taskId = taskId
      this.stage = 'result'
      this.progress.status = 'done'
      this.generationStartTime = null
    },

    // 暂停生成
    pauseGeneration() {
      this.isPaused = true
      this.progress.status = 'paused'
    },

    // 取消生成
    cancelGeneration() {
      this.isPaused = false
      this.progress.status = 'cancelled'
      this.generationStartTime = null
      // Mark all 'generating' images as error
      this.images.forEach(img => {
        if (img.status === 'generating') {
          img.status = 'error'
          img.error = '用户取消'
        }
      })
    },

    // 恢复生成
    resumeGeneration() {
      this.isPaused = false
      this.progress.status = 'generating'
      this.generationStartTime = Date.now() // 重置开始时间
    },

    // 设置单个图片为重试中状态
    setImageRetrying(index: number) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        image.status = 'retrying'
      }
    },

    // 获取失败的图片列表
    getFailedImages() {
      return this.images.filter(img => img.status === 'error')
    },

    // 获取失败图片对应的页面
    getFailedPages() {
      const failedIndices = this.images
        .filter(img => img.status === 'error')
        .map(img => img.index)
      return this.outline.pages.filter(page => failedIndices.includes(page.index))
    },

    // 检查是否有失败的图片
    hasFailedImages() {
      return this.images.some(img => img.status === 'error')
    },

    // 重置
    reset() {
      this.stage = 'input'
      this.topic = ''
      this.outline = {
        raw: '',
        pages: []
      }
      this.progress = {
        current: 0,
        total: 0,
        status: 'idle'
      }
      this.images = []
      this.taskId = null
      this.recordId = null
      this.userImages = []
      this.waitingApproval = false
      this.isPaused = false
      this.generationStartTime = null
      // 清除 localStorage
      localStorage.removeItem(STORAGE_KEY)
    },

    // 保存当前状态
    saveToStorage() {
      saveState(this)
    },

    // 恢复会话
    async restoreSession() {
      const savedTask = localStorage.getItem(STORAGE_KEY)
      if (!savedTask) return

      try {
        const parsed = JSON.parse(savedTask)
        if (!parsed.taskId) return

        // 无论如何先恢复本地数据
        this.taskId = parsed.taskId
        this.topic = parsed.topic || ''
        this.style = parsed.style || '小红书爆款图文风格'
        if (parsed.outline) this.outline = parsed.outline
        if (parsed.images) this.images = parsed.images

        // 如果正在生成中或等待审批，尝试从服务器获取最新状态
        if (parsed.stage === 'generating') {
          const { getTaskStatus } = await import('../api')
          if (this.taskId) {
            try {
              const result = await getTaskStatus(this.taskId)

              if (result.success && result.state) {
                console.log('Restoring session from server:', result.state)
                // 更新图片状态
                this.images = result.state.images.map((img: any) => ({
                  index: img.index,
                  url: img.url,
                  status: img.status === 'success' ? 'done' : (img.status === 'failed' ? 'error' : img.status)
                }))

                // 恢复审批状态
                if (typeof parsed.waitingApproval === 'boolean') {
                  this.waitingApproval = parsed.waitingApproval
                } else {
                  // Fallback logic if not saved:
                  // 如果只有第一张图好了，且第二张没开始，就算 waiting
                  const coverDone = this.images[0]?.status === 'done'
                  // pending isn't a valid status, check for generating
                  const contentNotStarted = !this.images[1] || this.images[1].status === 'generating'
                  if (coverDone && contentNotStarted) {
                    this.waitingApproval = true
                  }
                }
              }
            } catch (e: any) {
              // 404 means task expired or server restarted - clear invalid state
              if (e.response?.status === 404) {
                console.log('Task expired or not found, clearing invalid state')
                this.taskId = null
                this.stage = 'input'
                localStorage.removeItem(STORAGE_KEY)
              } else {
                console.error('Failed to restore session:', e)
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore session:', e)
      }

    }
  }
})

// Auto-save with debounce (using watch)
import { watch } from 'vue'

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

export function setupAutoSave() {
  const store = useGeneratorStore()

  // Debounced save function (500ms delay)
  const debouncedSave = debounce(() => {
    store.saveToStorage()
  }, 500)

  // Watch key fields and auto-save with debounce
  watch(
    () => ({
      stage: store.stage,
      topic: store.topic,
      outline: store.outline,
      progress: store.progress,
      images: store.images,
      taskId: store.taskId,
      recordId: store.recordId,
      waitingApproval: store.waitingApproval
    }),
    () => {
      debouncedSave()
    },
    { deep: true }
  )
}
