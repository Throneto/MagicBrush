<template>
  <!-- Gradient background with floating geometric decorations -->
  <div class="showcase-background" :class="{ 'is-ready': isReady }">
    <!-- Multi-layer gradient -->
    <div class="gradient-layer"></div>

    <!-- Floating geometric shapes -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
    </div>

    <!-- Subtle pattern overlay -->
    <div class="pattern-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/**
 * Showcase Background Component
 *
 * Features:
 * - Multi-layer gradient background
 * - Floating geometric decorations
 * - Subtle animated elements
 * - Smooth fade-in transition
 */

const isReady = ref(false)

onMounted(() => {
  // Short delay for smooth transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isReady.value = true
    })
  })
})
</script>

<style scoped>
/* Background container */
.showcase-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s ease-out;
  background-color: #0c0e14;
}

.showcase-background.is-ready {
  opacity: 1;
}

/* Multi-layer gradient */
.gradient-layer {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(29, 24, 54, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(74, 20, 140, 0.2) 0%, transparent 40%),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(211, 166, 37, 0.1) 0%, transparent 40%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(13, 71, 161, 0.15) 0%, transparent 40%);
}

/* Floating geometric shapes */
.floating-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(80px);
  animation: float 25s ease-in-out infinite;
  mix-blend-mode: screen;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(74, 20, 140, 0.3) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(211, 166, 37, 0.15) 0%, transparent 70%);
  bottom: -50px;
  left: -80px;
  animation-delay: -5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(13, 71, 161, 0.2) 0%, transparent 70%);
  top: 40%;
  left: 10%;
  animation-delay: -10s;
}

.shape-4 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(156, 39, 176, 0.2) 0%, transparent 70%);
  top: 20%;
  right: 15%;
  animation-delay: -7s;
}

.shape-5 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(29, 24, 54, 0.5) 0%, transparent 70%);
  bottom: 10%;
  right: 20%;
  animation-delay: -12s;
}

.shape-6 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(211, 166, 37, 0.1) 0%, transparent 70%);
  top: 60%;
  left: 60%;
  animation-delay: -3s;
}

/* Float animation */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -20px) scale(1.1);
  }
  50% {
    transform: translate(-15px, 15px) scale(0.9);
  }
  75% {
    transform: translate(-30px, -15px) scale(1.05);
  }
}

/* Pattern overlay - Starry Dust */
.pattern-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(1px 1px at 20% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 20%, rgba(211, 166, 37, 0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 40% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 100%),
    radial-gradient(2px 2px at 60% 60%, rgba(157, 92, 255, 0.2) 0%, transparent 100%);
  background-size: 100px 100px;
  opacity: 0.5;
  mix-blend-mode: overlay;
}

/* Responsive */
@media (max-width: 768px) {
  .shape {
    filter: blur(50px);
  }
  
  .shape-1, .shape-5 {
    width: 250px;
    height: 250px;
  }
  
  .shape-2, .shape-3, .shape-4 {
    width: 180px;
    height: 180px;
  }
  
  .shape-6 {
    width: 120px;
    height: 120px;
  }
}

/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .shape {
    animation: none;
  }
}
</style>
