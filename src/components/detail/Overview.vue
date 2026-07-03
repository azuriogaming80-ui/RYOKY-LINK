<!-- src/components/detail/Overview.vue -->
<template>
  <div class="overview-section">
    <h3 class="section-title">Synopsis</h3>
    <p 
      class="overview-text"
      :class="{ expanded: isExpanded }"
    >
      {{ displayText }}
    </p>
    <button 
      v-if="isTruncated" 
      class="expand-btn"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'Réduire' : 'Lire la suite' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  overview?: string;
}

const props = defineProps<Props>();
const isExpanded = ref(false);
const MAX_LENGTH = 280;

const isTruncated = computed(() => {
  return (props.overview?.length || 0) > MAX_LENGTH;
});

const displayText = computed(() => {
  if (!props.overview) return 'Aucun synopsis disponible.';
  if (isExpanded.value || !isTruncated.value) return props.overview;
  return props.overview.slice(0, MAX_LENGTH) + '...';
});
</script>

<style scoped>
.overview-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sao-text);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.overview-text {
  color: var(--sao-dim);
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
  transition: all 0.3s ease;
}

.expand-btn {
  background: transparent;
  border: none;
  color: var(--sao-cyan);
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 8px;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.expand-btn:hover {
  color: var(--sao-amber);
}
</style>