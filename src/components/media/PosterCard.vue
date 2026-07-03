<template>
  <div
    class="poster-card"
    :style="cardStyle"
    @click="$emit('select', item)"
    @mouseenter="$emit('hover', item)"
  >
    <div class="poster-image-wrapper">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="item.name"
        class="poster-image"
        loading="lazy"
        @error="imageError = true"
        :class="{ hidden: imageError }"
      />
      <div v-if="!imageUrl || imageError" class="poster-fallback">
        <span class="fallback-text">{{ item.name.charAt(0).toUpperCase() }}</span>
      </div>
      <div v-if="progress > 0" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>
      <div v-if="item.userData?.isFavorite" class="favorite-badge">♥</div>
    </div>
    <div class="poster-info">
      <span class="poster-title">{{ item.name }}</span>
      <span v-if="item.productionYear" class="poster-year">{{ item.productionYear }}</span>
      <span v-else-if="item.seriesName" class="poster-series">{{ item.seriesName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImageUrl } from '@/composables/useImageUrl'
import type { BaseItemDto } from '@/types'

interface Props {
  item: BaseItemDto
  aspectRatio?: number
}
const props = defineProps<Props>()
defineEmits(['select', 'hover'])

const imageError = ref(false)
const { getPrimaryImageUrl } = useImageUrl()
const imageUrl = computed(() => {
  if (!props.item.id || imageError.value) return ''
  return getPrimaryImageUrl(props.item.id, { width: 300, tag: props.item.imageTags?.Primary })
})
const progress = computed(() => {
  if (!props.item.userData?.playbackPositionTicks || !props.item.runTimeTicks) return 0
  return (props.item.userData.playbackPositionTicks / props.item.runTimeTicks) * 100
})
const cardStyle = computed(() => ({
  aspectRatio: props.aspectRatio ? `${props.aspectRatio}` : '2/3',
}))
</script>

<style scoped>
.poster-card {
  flex-shrink: 0;
  width: 160px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  scroll-snap-align: start;
}
.poster-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px var(--sao-cyan-glow, rgba(0, 255, 255, 0.3));
}
.poster-image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: var(--sao-surface);
  aspect-ratio: 2/3;
}
.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.poster-image.hidden {
  display: none;
}
.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sao-surface) 0%, var(--sao-bg) 100%);
}
.fallback-text {
  font-size: 3rem;
  font-weight: 700;
  color: var(--sao-dim);
  opacity: 0.5;
}
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
}
.progress-fill {
  height: 100%;
  background: var(--sao-cyan);
  transition: width 0.3s;
}
.favorite-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #ff4444;
  font-size: 1.2rem;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}
.poster-info {
  padding: 8px 4px;
}
.poster-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--sao-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poster-year,
.poster-series {
  font-size: 0.8rem;
  color: var(--sao-dim);
}
</style>