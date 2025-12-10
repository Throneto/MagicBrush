<template>
  <div class="container" style="max-width: 100%;">
    <div class="page-header" style="max-width: 1200px; margin: 0 auto 30px auto;">
      <div>
        <h1 class="page-title">编辑大纲</h1>
        <p class="page-subtitle">调整页面顺序，修改文案，打造完美内容</p>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <!-- 风格选择器 -->
        <div class="style-selector">
          <select 
            :value="store.style" 
            @change="updateStyle($event)"
            class="style-select"
          >
            <option v-for="s in styleOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>

        <button class="btn btn-secondary" @click="goBack" style="background: white; border: 1px solid var(--border-color);">
          上一步
        </button>
        <button class="btn btn-primary" @click="startGeneration">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
          开始生成图片
        </button>
      </div>
    </div>

    <div class="outline-grid">
      <div 
        v-for="(page, idx) in store.outline.pages" 
        :key="page.index"
        class="card outline-card"
        :draggable="true"
        @dragstart="onDragStart($event, idx)"
        @dragover.prevent="onDragOver($event, idx)"
        @drop="onDrop($event, idx)"
        :class="{ 'dragging-over': dragOverIndex === idx }"
      >
        <!-- 拖拽手柄 (改为右上角或更加隐蔽) -->
        <div class="card-top-bar">
          <div class="page-info">
             <span class="page-number">P{{ idx + 1 }}</span>
             <span class="page-type" :class="page.type">{{ getPageTypeName(page.type) }}</span>
          </div>
          
          <div class="card-controls">
            <div class="drag-handle" title="拖拽排序">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
            </div>
            <!-- 移动端排序按钮 -->
            <div class="mobile-sort-btns">
              <button class="icon-btn" @click="movePageUp(idx)" :disabled="idx === 0" title="上移">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button class="icon-btn" @click="movePageDown(idx)" :disabled="idx === store.outline.pages.length - 1" title="下移">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
            <button class="icon-btn" @click="deletePage(idx)" title="删除此页">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <textarea
          v-model="page.content"
          class="textarea-paper"
          placeholder="在此输入文案..."
          @input="store.updatePage(page.index, page.content)"
        />
        
        <div class="word-count">{{ page.content.length }} 字</div>
      </div>

      <!-- 添加按钮卡片 -->
      <div class="card add-card-dashed" @click="addPage('content')">
        <div class="add-content">
          <div class="add-icon">+</div>
          <span>添加页面</span>
        </div>
      </div>
    </div>
    
    <div style="height: 100px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGeneratorStore } from '../stores/generator'

const router = useRouter()
const store = useGeneratorStore()

const dragOverIndex = ref<number | null>(null)
const draggedIndex = ref<number | null>(null)

const styleOptions = [
  { label: '默认 (爆款图文)', value: '小红书爆款图文风格' },
  { label: '3D 黏土风', value: '3D Clay 黏土风' },
  { label: '3D 写实 (光泽感)', value: '具有光泽感和真实光影的3D/写实风格, High Gloss 3D Render, Octane Render' },
  { label: '日系手绘', value: '日系手绘插画' },
  { label: '日韩时尚插画', value: `日韩系极简时尚插画 (Fashion Illustration) 融合摄影质感风格 - 金正基 Kim Jung Gi 写实时尚摄影:
【核心风格】照片真实感混合水彩杰作 (Photo-Realistic Watercolor Masterpiece Blend), 超精细纹理 (Ultra-Fine Textures), 触感真实 (Tactile Realism), 逼真时尚摄影 (Realistic Fashion Photography), 超写实织物与照片级细节完美融合, fashion editorial magazine quality, hyper-detailed photograph meets delicate watercolor illustration mastery
【人像身材】cute Asian girl, petite slender build with narrow shoulders, extremely long legs taking up 55% of body height, very high waist position with tiny waist, 6.5-7 heads tall doll-like proportions, slender arms with small delicate hands and feet, soft healthy slight chubbiness not bony, youthful cute proportions with slightly meaty thighs
【面部与皮肤】hyperrealistic skin with visible pores and micro downy hair, subtle oil sheen on T-zone, ultra-detailed iris with limbal ring, natural lip lines texture, sharp individual eyelashes, delicate features, 8K texture scan quality skin detail, extreme close-up material texture capability
【发丝】real individual hair strands with natural flyaway and glossy specular highlights, fluffy volume, soft watercolor edges, every strand rendered with photorealistic precision, 8K纹理扫描质量 hair rendering
【混合风格】photorealistic face and skin + ultra-realistic fabric textures + delicate watercolor fashion illustration background, perfect seamless fusion of photography and hand-painted watercolor, detailed realistic anime style with soft painting, 触感真实 tactile realism, 照片级细节 photo-level detail
【服饰材质专项 - 极致重要】8K纹理扫描质量 (8K Texture Scan Quality) fabrics, 极致特写材质纹理 (Extreme Close-up Material Textures), visible individual thread fibers and weave patterns at microscopic level, realistic fabric drape physics with natural creases folds and gravity effects, tactile material textures rendered with touch-sensitive detail (cashmere fuzz softness, denim warp and weft grain, silk lustrous sheen, genuine leather grain and patina, wool knit loops and cable patterns, velvet pile direction, cotton weave density), soft halo fuzz catching ambient light on knitwear fleece and mohair, 超写实织物 (Ultra-Realistic Fabrics) with visible fiber structure, layered outfit styling with visible depth and shadow between clothing layers (内搭中层外套三层层次分明), garment construction details (French seams, blind hem stitching, covered buttons, invisible zippers, decorative topstitching)
【鞋子材质专项 - 极致重要】8K纹理扫描质量 footwear rendering (8K Texture Scan Quality), 极致特写材质纹理 (Extreme Close-up Material Textures), visible genuine leather grain and texture patterns at pore level, realistic rubber sole tread patterns and grip texture, shoelace individual fiber texture with wax coating visible, sneaker mesh fabric weave detail with breathable holes, heel and sole material distinction with visible construction layers, appropriate natural wear marks and realistic creasing at flex points, metallic hardware details (brass eyelets, silver buckles, embossed logos, metal aglets), suede nap direction and brushed texture, patent leather mirror shine, canvas duck weave pattern
【整体层次搭配】coordinated layered outfit with clear visual hierarchy and depth perception (整体服装搭配层次感), distinct inner layer (base), middle layer (insulation/style), outer layer (outerwear) with visible overlap and tucking, accessories harmoniously complement the ensemble (structured bags, silk scarves, delicate jewelry, statement belts), thoughtful color palette harmony across all clothing pieces with tonal coordination, seasonal appropriate styling with intentional texture variety and contrast (soft vs structured, matte vs shiny, smooth vs textured), outfit tells a cohesive fashion story
【技术规格】full body composition from head to toe, soft natural pose with editorial flair, warm beige textured watercolor paper background with visible handmade paper fibers, soft golden hour side lighting with catchlights, extremely shallow depth of field with bokeh, hyper-detailed textures throughout, 8K ultra-high resolution quality, 极致特写材质纹理 capability throughout, trending on xiaohongshu lofter and pinterest fashion boards, 逼真时尚摄影 realistic fashion photography, magazine cover quality finish` },
  { label: '极简摄影', value: '极简摄影风' },
  { label: '赛博朋克', value: '赛博朋克未来风' }
]

const updateStyle = (e: Event) => {
  const target = e.target as HTMLSelectElement
  store.setStyle(target.value)
}

const getPageTypeName = (type: string) => {
  const names = {
    cover: '封面',
    content: '内容',
    summary: '总结'
  }
  return names[type as keyof typeof names] || '内容'
}

// 拖拽逻辑
const onDragStart = (e: DragEvent, index: number) => {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
  }
}

const onDragOver = (e: DragEvent, index: number) => {
  if (draggedIndex.value === index) return
  dragOverIndex.value = index
}

const onDrop = (e: DragEvent, index: number) => {
  dragOverIndex.value = null
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    store.movePage(draggedIndex.value, index)
  }
  draggedIndex.value = null
}

const deletePage = (index: number) => {
  if (confirm('确定要删除这一页吗？')) {
    store.deletePage(index)
  }
}

const addPage = (type: 'cover' | 'content' | 'summary') => {
  store.addPage(type, '')
  // 滚动到底部
  nextTick(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
}

const goBack = () => {
  router.back()
}

const startGeneration = () => {
  store.startGeneration()
  router.push('/generate')
}
const movePageUp = (index: number) => {
  if (index > 0) {
    store.movePage(index, index - 1)
  }
}

const movePageDown = (index: number) => {
  if (index < store.outline.pages.length - 1) {
    store.movePage(index, index + 1)
  }
}
</script>

<style scoped>
/* 网格布局 */
.outline-grid {
  display: grid;
  /* 响应式列：最小宽度 280px，自动填充 */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.outline-card {
  display: flex;
  flex-direction: column;
  padding: 16px; /* 减小内边距 */
  transition: all 0.2s ease;
  border: none;
  border-radius: 8px; /* 较小的圆角 */
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  /* 保持一定的长宽比感，虽然高度自适应，但由于 flex column 和内容撑开，
     这里设置一个 min-height 让它看起来像个竖向卡片 */
  min-height: 360px; 
  position: relative;
}

.outline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 10;
}

.outline-card.dragging-over {
  border: 2px dashed var(--primary);
  opacity: 0.8;
}

/* 顶部栏 */
.card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-number {
  font-size: 14px;
  font-weight: 700;
  color: #ccc;
  font-family: 'Inter', sans-serif;
}

.page-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.page-type.cover { color: #FF4D4F; background: #FFF1F0; }
.page-type.content { color: #8c8c8c; background: #f5f5f5; }
.page-type.summary { color: #52C41A; background: #F6FFED; }

.card-controls {
  display: flex;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.outline-card:hover .card-controls { opacity: 1; }

.drag-handle {
  cursor: grab;
  padding: 2px;
}
.drag-handle:active { cursor: grabbing; }

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 2px;
  transition: color 0.2s;
}
.icon-btn:hover { color: #FF4D4F; }

/* 文本区域 - 核心 */
.textarea-paper {
  flex: 1; /* 占据剩余空间 */
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 16px; /* 更大的字号 */
  line-height: 1.7; /* 舒适行高 */
  color: #333;
  resize: none; /* 禁止手动拉伸，保持卡片整体感 */
  font-family: inherit;
  margin-bottom: 10px;
}

.textarea-paper:focus {
  outline: none;
}

.word-count {
  text-align: right;
  font-size: 11px;
  color: #ddd;
  margin-top: auto;
}

/* 添加卡片 */
.add-card-dashed {
  border: 2px dashed #eee;
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 360px;
  color: #ccc;
  transition: all 0.2s;
}

.add-card-dashed:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(255, 36, 66, 0.02);
}

.add-content {
  text-align: center;
}

.add-icon {
  font-size: 32px;
  font-weight: 300;
  margin-bottom: 8px;
}

.style-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  color: #333;
  background-color: white;
  min-width: 160px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.style-select:hover {
  border-color: var(--primary);
}

.mobile-sort-btns {
  display: none;
  gap: 4px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-header > div:last-child {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .style-selector {
    flex: 1;
    min-width: 100%;
  }

  .style-select {
    width: 100%;
  }
  
  .outline-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .mobile-sort-btns {
    display: flex;
  }
  
  .drag-handle {
    display: none;
  }
}
</style>
