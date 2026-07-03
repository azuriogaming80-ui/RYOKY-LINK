<template>
  <div class="media-banner" v-if="currentItem">
    <div class="banner-backdrop">
      <img :src="backdropUrl" :alt="currentItem.name" class="backdrop-image" />
      <div class="banner-gradient" />
    </div>
    <div class="banner-content">
      <div class="banner-info">
        <h1 class="banner-title">{{ currentItem.name }}</h1>
        <p class="banner-meta" v-if="metaText">{{ metaText }}</p>
        <p class="banner-overview" v-if="truncatedOverview">{{ truncatedOverview }}</p>
        <div class="banner-actions">
          <button class="btn-play" @click="$emit('play', currentItem)">▶ LECTURE</button>
          <button class="btn-detail" @click="$emit('detail', currentItem)">+ DÉTAILS</button>
        </div>
      </div>
      <div class="banner-nav" v-if="items.length > 1">
        <button
          v-for="(item, idx) in items"
          :key="item.id"
          class="nav-dot"
          :class="{ active: idx === currentIndex }"
          @click="currentIndex = idx"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useImageUrl } from '@/composables/useImageUrl'
import type { BaseItemDto } from '@/types'

interface Props {
  items: BaseItemDto[]
  autoPlay?: boolean
  interval?: number
}
const props = withDefaults(defineProps<Props>(), { autoPlay: true, interval: 8000 })
defineEmits(['play', 'detail'])

const { getBackdropUrl } = useImageUrl()
const currentIndex = ref(0)
const currentItem = computed(() => props.items[currentIndex.value] || null)

const backdropUrl = computed(() => {
  if (!currentItem.value) return ''
  return getBackdropUrl(currentItem.value.id, {
    width: 1920,
    tag: currentItem.value.backdropImageTags?.[0],
  })
})

const metaText = computed(() => {
  const item = currentItem.value
  if (!item) return ''
  const parts: string[] = []
  if (item.productionYear) parts.push(String(item.productionYear))
  if (item.officialRating) parts.push(item.officialRating)
  if (item.communityRating) parts.push(`⭐ ${item.communityRating.toFixed(1)}`)
  return parts.join(' • ')
})

const truncatedOverview = computed(() => {
  const text = currentItem.value?.overview || ''
  return text.length > 200 ? text.substring(0, 200) + '...' : text
})

let timer: ReturnType<typeof setInterval> | null = null
function startTimer() {
  if (timer) clearInterval(timer)
  if (props.autoPlay && props.items.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.items.length
    }, props.interval)
  }
}
watch(() => props.items, () => {
  currentIndex.value = 0
  startTimer()
}, { immediate: true })
</script>

<style scoped>
.media-banner {
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
  margin-bottom: 32px;
}
.banner-backdrop {
  position: absolute;
  inset: 0;
}
.backdrop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}
.banner-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 50%, var(--sao-bg) 100%);
}
.banner-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  z-index: 2;
}
.banner-info {
  max-width: 600px;
}
.banner-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sao-text);
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}
.banner-meta {
  font-size: 0.9rem;
  color: var(--sao-dim);
  margin-bottom: 12px;
}
.banner-overview {
  font-size: 1rem;
  color: var(--sao-text-secondary, #ccc);
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.banner-actions {
  display: flex;
  gap: 12px;
}
.btn-play {
  background: var(--sao-cyan);
  color: var(--sao-bg);
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.btn-play:hover {
  background: var(--sao-amber);
  box-shadow: 0 0 20px var(--sao-amber-glow, rgba(255, 200, 0, 0.4));
}
.btn-detail {
  background: rgba(255, 255, 255, 0.1);
  color: var(--sao-text);
  border: 1px solid var(--sao-dim);
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.btn-detail:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--sao-cyan);
}
.banner-nav {
  position: absolute;
  bottom: 24px;
  right: 32px;
  display: flex;
  gap: 8px;
}
.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--sao-dim);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}
.nav-dot.active {
  background: var(--sao-cyan);
  border-color: var(--sao-cyan);
  box-shadow: 0 0 8px var(--sao-cyan);
}

@media (max-width: 768px) {
  .media-banner {
    height: 40vh;
    min-height: 300px;
  }
  .banner-title {
    font-size: 1.5rem;
  }
  .banner-overview {
    display: none;
  }
  .banner-actions {
    flex-direction: column;
  }
  .btn-play,
  .btn-detail {
    width: 100%;
    text-align: center;
  }
}
</style>