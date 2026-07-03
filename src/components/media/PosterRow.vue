<template>
  <div class="poster-row" :class="{ 'poster-row--grid': layout === 'grid' }">
    <div class="row-header" v-if="label">
      <h3 class="row-label">{{ label }}</h3>
      <button v-if="onLabelClick" class="see-all" @click="onLabelClick">Voir tout →</button>
    </div>
    <div
      class="row-scroll"
      ref="scrollContainer"
      @wheel="handleWheel"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      :class="{ 'is-dragging': isDragging }"
    >
      <PosterCard
        v-for="item in posters"
        :key="item.id"
        :item="item"
        :aspect-ratio="aspectRatio"
        @select="$emit('select', item)"
        @hover="$emit('hover', item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PosterCard from './PosterCard.vue'
import type { BaseItemDto } from '@/types'

interface Props {
  label?: string
  posters: BaseItemDto[]
  aspectRatio?: number
  onLabelClick?: () => void
  layout?: 'row' | 'grid'
}
withDefaults(defineProps<Props>(), { layout: 'row' })
defineEmits(['select', 'hover'])

const scrollContainer = ref<HTMLElement>()
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

// Scroll horizontal avec la molette (shift+wheel natif, mais on améliore)
function handleWheel(e: WheelEvent) {
  if (!scrollContainer.value || layout === 'grid') return
  const el = scrollContainer.value
  const canScrollLeft = el.scrollLeft > 0
  const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth

  // Si on peut scroller horizontalement dans la direction de la wheel, on l'intercepte
  if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }
}

// Drag to scroll
function startDrag(e: MouseEvent) {
  if (!scrollContainer.value || layout === 'grid') return
  isDragging.value = true
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !scrollContainer.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 1.5
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
}

function stopDrag() {
  isDragging.value = false
}
</script>

<style scoped>
.poster-row {
  margin-bottom: 24px;
}
.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;
}
.row-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--sao-text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.see-all {
  background: none;
  border: none;
  color: var(--sao-cyan);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
}
.see-all:hover {
  color: var(--sao-amber);
}
.row-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 16px;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
}
.row-scroll::-webkit-scrollbar {
  display: none;
}
.row-scroll.is-dragging {
  cursor: grabbing;
}
.row-scroll :deep(.poster-card) {
  user-select: none;
  pointer-events: auto;
}

/* Mode grille pour mobile (sections récentes) */
.poster-row--grid .row-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  overflow-x: visible;
  padding: 0 16px;
  cursor: default;
}
.poster-row--grid .row-scroll :deep(.poster-card) {
  width: 100%;
}
</style>