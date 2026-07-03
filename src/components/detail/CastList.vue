<!-- src/components/detail/CastList.vue -->
<template>
  <div v-if="cast.length > 0" class="cast-section">
    <h3 class="section-title">Distribution</h3>
    <div class="cast-scroll">
      <div 
        v-for="person in displayCast" 
        :key="person.id || person.name"
        class="cast-card"
      >
        <div class="cast-image-wrapper">
          <img
            v-if="person.id && person.primaryImageTag"
            :src="getPersonImage(person.id, person.primaryImageTag)"
            :alt="person.name"
            class="cast-image"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="cast-placeholder">
            {{ person.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <span class="cast-name">{{ person.name }}</span>
        <span v-if="person.role" class="cast-role">{{ person.role }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { jellyfinApi } from '@/services/jellyfin-api';
import type { BaseItemPerson } from '@/types/item';

interface Props {
  cast: BaseItemPerson[];
}

const props = defineProps<Props>();
const displayCast = computed(() => props.cast.slice(0, 20));

function getPersonImage(personId: string, tag: string): string {
  return jellyfinApi.getImageUrl(personId, 'Primary', {
    width: 200,
    tag,
  });
}

function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    const placeholder = document.createElement('div');
    placeholder.className = 'cast-placeholder';
    placeholder.textContent = img.alt?.charAt(0).toUpperCase() || '?';
    parent.appendChild(placeholder);
  }
}
</script>

<style scoped>
.cast-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sao-text);
  margin: 0 0 16px 0;
  padding: 0 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cast-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 0 16px 8px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.cast-scroll::-webkit-scrollbar {
  display: none;
}

.cast-card {
  flex-shrink: 0;
  width: 100px;
  text-align: center;
  scroll-snap-align: start;
}

.cast-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--sao-surface);
  margin-bottom: 8px;
  border: 2px solid rgba(0, 255, 255, 0.1);
}

.cast-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cast-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--sao-cyan);
  background: rgba(0, 255, 255, 0.05);
}

.cast-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--sao-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cast-role {
  display: block;
  font-size: 0.75rem;
  color: var(--sao-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>