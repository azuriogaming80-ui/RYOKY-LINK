<template>
  <section v-if="items && items.length > 0" class="media-rail">
    <h2 class="rail-title">{{ title }}</h2>
    
    <div class="rail-scroll">
      <MediaCard 
        v-for="item in items" 
        :key="item.Id"
        :item="item"
        class="media-card-wrapper"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import MediaCard from './MediaCard.vue';

defineProps<{
  title: string;
  items: any[];
}>();
</script>

<style scoped>
.media-rail {
  margin-bottom: 2.5rem;
  width: 100%;
}

.rail-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--sao-text);
  margin: 0 0 1rem 1.5rem; /* Padding gauche global du dashboard */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

.rail-scroll {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1rem 1.5rem 2rem 1.5rem; /* Padding bottom pour laisser place au zoom/scale */
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* Masquer la scrollbar native pour un look plus propre (Chrome/Safari) */
.rail-scroll::-webkit-scrollbar {
  display: none;
}

/* Espacement safe pour le focus */
.media-card-wrapper {
  scroll-snap-align: start;
}
</style>