<!-- src/components/media/MediaInfo.vue -->
<template>
  <div class="media-info">
    <h1 class="media-title">{{ item.name }}</h1>
    
    <div class="media-meta">
      <span v-if="year" class="meta-year">{{ year }}</span>
      <span v-if="runtime" class="meta-runtime">{{ runtime }} min</span>
      <span v-if="rating" class="meta-rating">
        <span class="star">★</span> {{ rating }}
      </span>
      <span v-if="item.officialRating" class="meta-rating-tag">{{ item.officialRating }}</span>
    </div>

    <div v-if="item.genres?.length" class="media-genres">
      <span v-for="genre in item.genres" :key="genre" class="genre-tag">
        {{ genre }}
      </span>
    </div>

    <div v-if="item.tags?.length" class="media-tags">
      <span v-for="tag in item.tags.slice(0, 5)" :key="tag" class="tag-chip">
        {{ tag }}
      </span>
    </div>

    <div v-if="item.studios?.length" class="media-studios">
      {{ item.studios.map(s => s.name).join(' • ') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BaseItemDto } from '@/types/item';

interface Props {
  item: BaseItemDto;
  year?: number | null;
  runtime?: number | null;
  rating?: string | null;
}

defineProps<Props>();
</script>

<style scoped>
.media-info {
  padding: 0 16px;
}

.media-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sao-text);
  margin: 0 0 12px 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.media-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-year,
.meta-runtime {
  color: var(--sao-dim);
  font-size: 0.95rem;
}

.meta-rating {
  color: var(--sao-amber);
  font-size: 0.95rem;
  font-weight: 600;
}

.star {
  color: #ffd700;
}

.meta-rating-tag {
  border: 1px solid var(--sao-dim);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--sao-dim);
}

.media-genres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.genre-tag {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: var(--sao-cyan);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.media-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tag-chip {
  background: var(--sao-surface);
  color: var(--sao-dim);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.media-studios {
  color: var(--sao-dim);
  font-size: 0.85rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .media-title {
    font-size: 1.5rem;
  }
}
</style>