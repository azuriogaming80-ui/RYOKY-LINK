<!-- src/components/detail/RelatedItems.vue -->
<template>
  <div v-if="items.length > 0" class="related-section">
    <h3 class="section-title">Vous pourriez aimer</h3>
    <div class="related-scroll">
      <PosterCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        aspect-ratio="2/3"
        @select="$emit('select', item)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PosterCard from '@/components/media/PosterCard.vue';
import type { BaseItemDto } from '@/types/item';

interface Props {
  items: BaseItemDto[];
}

defineProps<Props>();
defineEmits(['select']);
</script>

<style scoped>
.related-section {
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

.related-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 16px 8px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.related-scroll::-webkit-scrollbar {
  display: none;
}

.related-scroll :deep(.poster-card) {
  width: 140px;
}
</style>