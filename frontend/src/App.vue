<template>
  <div id="app">
    <!-- 侧边栏 Sidebar -->
    <aside class="layout-sidebar">
      <div class="logo-area">
        <img src="/logo.png" alt="MagicBrush" class="logo-icon" />
        <span class="logo-text">MagicBrush</span>
      </div>
      
      <nav class="nav-menu">
        <RouterLink to="/" class="nav-item" active-class="active">
          <!-- Magic Wand Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2l-5 5"></path>
            <path d="M6.8 12.6l-1.4 1.4"></path>
            <path d="M5.4 11.2l-1.4 1.4"></path>
            <path d="M9.6 9.8l-1.4 1.4"></path>
            <path d="M11.2 5.4l-1.4 1.4"></path>
            <path d="M2.5 21.5l8-8"></path>
            <path d="M16 4l4-2l-2 4l4 2l-4 2l2 4l-4-2l-2 4l-2-4l-4-2l4-2z"></path>
          </svg>
          魔法创作
        </RouterLink>
        <RouterLink to="/history" class="nav-item" active-class="active">
          <!-- Scroll / History Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          历史咒语
        </RouterLink>
        <RouterLink to="/settings" class="nav-item" active-class="active">
          <!-- Crystal Ball / Settings Icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
          魔法设置
        </RouterLink>
      </nav>
      
      <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; transition: background 0.2s; cursor: pointer;" class="user-profile">
          <img src="/logo.png" alt="Wizard" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-gold);" />
          <div>
            <div style="font-size: 15px; font-weight: 600; font-family: var(--font-heading); color: var(--primary);">Harry Potter</div>
            <div style="font-size: 12px; color: var(--text-sub);">Gryffindor</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="layout-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>

        <!-- 全局页脚版权信息（首页除外） -->
        <footer v-if="route.path !== '/'" class="global-footer">
          <div class="footer-content">
            <div class="footer-text">
              © 2025 MagicBrush by Harry
            </div>
          </div>
        </footer>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { onMounted } from 'vue'
import { setupAutoSave } from './stores/generator'
import { useGeneratorStore } from './stores/generator'

const store = useGeneratorStore()

// 启用自动保存到 localStorage
onMounted(() => {
  store.restoreSession()
  setupAutoSave()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
