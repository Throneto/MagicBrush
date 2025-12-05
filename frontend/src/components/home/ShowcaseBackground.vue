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
}

.showcase-background.is-ready {
  opacity: 1;
}

/* Multi-layer gradient */
.gradient-layer {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 100, 130, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(255, 182, 193, 0.15) 0%, transparent 40%),
    radial-gradient(ellipse 50% 30% at 0% 100%, rgba(255, 218, 185, 0.12) 0%, transparent 40%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255, 36, 66, 0.05) 0%, transparent 40%),
    linear-gradient(180deg, #ffffff 0%, #fefefe 50%, #fafafa 100%);
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
  opacity: 0.6;
  filter: blur(60px);
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 218, 185, 0.2) 100%);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(255, 36, 66, 0.1) 0%, rgba(255, 140, 150, 0.15) 100%);
  bottom: -50px;
  left: -80px;
  animation-delay: -5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(255, 220, 200, 0.25) 0%, rgba(255, 180, 160, 0.15) 100%);
  top: 40%;
  left: 10%;
  animation-delay: -10s;
}

.shape-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(255, 100, 130, 0.12) 0%, rgba(255, 200, 210, 0.2) 100%);
  top: 20%;
  right: 15%;
  animation-delay: -7s;
}

.shape-5 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, rgba(255, 240, 245, 0.4) 0%, rgba(255, 200, 210, 0.15) 100%);
  bottom: 10%;
  right: 20%;
  animation-delay: -12s;
}

.shape-6 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, rgba(255, 36, 66, 0.08) 0%, rgba(255, 150, 170, 0.12) 100%);
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
    transform: translate(20px, -15px) scale(1.02);
  }
  50% {
    transform: translate(-10px, 10px) scale(0.98);
  }
  75% {
    transform: translate(-20px, -10px) scale(1.01);
  }
}

/* Pattern overlay */
.pattern-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 36, 66, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 182, 193, 0.03) 0%, transparent 50%);
  mix-blend-mode: multiply;
}

/* Responsive */
@media (max-width: 768px) {
  .shape {
    filter: blur(40px);
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
