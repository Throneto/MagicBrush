<template>
  <div class="container home-container">
    <!-- 图片网格轮播背景 -->
    <ShowcaseBackground />

    <!-- Hero Area -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="brand-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          AI 驱动的魔刷创作助手
        </div>
        <div class="platform-slogan">
          让传播不再需要门槛，让创作从未如此简单
        </div>
        <h1 class="page-title">灵感一触即发</h1>
        <p class="page-subtitle">输入你的创意主题，让 AI 帮你生成爆款标题、正文和封面图</p>
      </div>

      <!-- 主题输入组合框 -->
      <ComposerInput
        ref="composerRef"
        v-model="topic"
        :loading="loading"
        @generate="handleGenerate"
        @imagesChange="handleImagesChange"
      />
    </div>

    <!-- 版权信息 -->
    <div class="page-footer">
      <div class="footer-copyright">
        © 2025 MagicBrush by Harry
      </div>
      <div class="footer-license">
        <span style="opacity: 0.8;">基于 <a href="https://github.com/HisMax/RedInk" target="_blank" rel="noopener noreferrer">RedInk</a> 开源项目修改</span>
        <span style="margin: 0 8px; opacity: 0.3;">|</span>
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">本演示遵循 CC BY-NC-SA 4.0 协议</a>
      </div>
    </div>

    <!-- Error toast with close button -->
    <Transition name="toast">
      <div v-if="error" class="error-toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span class="error-message">{{ error }}</span>
        <button class="error-close" @click="clearError" title="关闭">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="error-progress"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGeneratorStore } from '../stores/generator'
import { generateOutline } from '../api'

// Import components
import ShowcaseBackground from '../components/home/ShowcaseBackground.vue'
import ComposerInput from '../components/home/ComposerInput.vue'

const router = useRouter()
const store = useGeneratorStore()

// State
const topic = ref('')
const loading = ref(false)
const error = ref('')
const composerRef = ref<InstanceType<typeof ComposerInput> | null>(null)

// Uploaded image files
const uploadedImageFiles = ref<File[]>([])

// Error auto-dismiss timer
let errorTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Clear error with optional delay
 */
function clearError() {
  error.value = ''
  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
}

/**
 * Set error with auto-dismiss
 */
function setError(message: string) {
  error.value = message
  // Auto-dismiss after 5 seconds
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    error.value = ''
  }, 5000)
}

/**
 * Handle images change
 */
function handleImagesChange(images: File[]) {
  uploadedImageFiles.value = images
}

/**
 * Generate outline
 */
async function handleGenerate() {
  if (!topic.value.trim()) return

  loading.value = true
  clearError()

  try {
    const imageFiles = uploadedImageFiles.value

    const result = await generateOutline(
      topic.value.trim(),
      imageFiles.length > 0 ? imageFiles : undefined
    )

    if (result.success && result.pages) {
      store.setTopic(topic.value.trim())
      store.setOutline(result.outline || '', result.pages)
      store.recordId = null

      // Save uploaded images to store
      if (imageFiles.length > 0) {
        store.userImages = imageFiles
      } else {
        store.userImages = []
      }

      // Clear ComposerInput previews
      composerRef.value?.clearPreviews()
      uploadedImageFiles.value = []

      router.push('/outline')
    } else {
      setError(result.error || '生成大纲失败，请重试')
    }
  } catch (err: any) {
    const message = err.message || '网络错误'
    setError(`请求失败：${message}`)
  } finally {
    loading.value = false
  }
}

// Cleanup timer on unmount
onUnmounted(() => {
  if (errorTimer) clearTimeout(errorTimer)
})
</script>

<style scoped>
.home-container {
  max-width: 1100px;
  padding-top: 10px;
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 56px 64px;
  animation: fadeInUp 0.8s ease-out;
  background: rgba(12, 14, 20, 0.6);
  border-radius: 28px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 12px 48px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(211, 166, 37, 0.2);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(211, 166, 37, 0.5), transparent);
}

.hero-content {
  margin-bottom: 36px;
}

.brand-pill {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(90deg, rgba(211, 166, 37, 0.1) 0%, rgba(211, 166, 37, 0.2) 100%);
  color: var(--primary);
  border: 1px solid rgba(211, 166, 37, 0.3);
  border-radius: 100px;
  font-size: 14px;
  font-family: var(--font-heading);
  font-weight: 600;
  margin-bottom: 24px;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(211, 166, 37, 0.1);
  backdrop-filter: blur(5px);
}

.platform-slogan {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 24px;
  line-height: 1.6;
  font-family: var(--font-heading);
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-sub);
  margin-top: 12px;
  font-style: italic;
  font-family: var(--font-body);
}

/* Page Footer */
.page-footer {
  text-align: center;
  padding: 24px 0 16px;
  margin-top: 20px;
}

.footer-copyright {
  font-size: 16px;
  color: var(--text-sub);
  font-weight: 500;
  margin-bottom: 6px;
  font-family: var(--font-heading);
}

.footer-copyright a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.footer-copyright a:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px var(--primary);
}

.footer-license {
  font-size: 14px;
  color: var(--text-placeholder);
}

.footer-license a {
  color: var(--text-secondary);
  text-decoration: none;
}

.footer-license a:hover {
  color: var(--primary);
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(139, 0, 0, 0.9);
  color: #ffcccc;
  padding: 14px 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  max-width: 90vw;
  overflow: hidden;
  border: 1px solid rgba(255, 77, 79, 0.3);
  backdrop-filter: blur(8px);
}

.error-message {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  font-family: var(--font-body);
}

.error-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.error-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(255, 77, 79, 0.8);
  animation: progressShrink 5s linear forwards;
}

@keyframes progressShrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Toast transition */
.toast-enter-active {
  animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toastOut 0.3s ease-in forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.9);
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(30px);
    filter: blur(5px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
