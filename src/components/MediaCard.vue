<template>
  <button 
    class="media-card" 
    @click="navigateToDetails"
    :aria-label="`Voir les détails de ${item.Name}`"
  >
    <div class="card-poster">
      <img 
        v-if="imageUrl && !imgError" 
        :src="imageUrl" 
        :alt="item.Name"
        loading="lazy"
        class="poster-img"
        @error="handleImgError"
      />
      <div v-else class="poster-fallback">
        <span>{{ item.Name?.charAt(0) || '?' }}</span>
      </div>

      <!-- Badge de progression (uniquement si commencé mais pas fini) -->
      <div v-if="progressPercent > 0 && progressPercent < 95" class="progress-container">
        <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <div class="card-info">
      <h3 class="card-title">{{ item.Name }}</h3>
      <p v-if="item.SeriesName" class="card-subtitle">{{ item.SeriesName }}</p>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { jellyfinApi } from '@/services/jellyfin-api';

const props = defineProps<{
  item: any;
}>();

const router = useRouter();
const imgError = ref(false);

// 🛡️ Reset de l'erreur si l'item change (ex: scroll infini ou changement de rail)
watch(() => props.item?.Id, () => {
  imgError.value = false;
});

const handleImgError = () => {
  imgError.value = true;
};

// Génération de l'URL de l'image (Format 2:3 optimisé pour le portrait)
const imageUrl = computed(() => {
  if (!props.item?.Id) return '';
  // On demande une image de largeur 300px pour optimiser le chargement
  return jellyfinApi.getImageUrl(props.item.Id, 'Primary', { width: 300 });
});

// Calcul du pourcentage de lecture
const progressPercent = computed(() => {
  const position = props.item?.UserData?.PlaybackPositionTicks || 0;
  const runtime = props.item?.RunTimeTicks || 0;
  if (runtime === 0) return 0;
  return Math.min(100, Math.round((position / runtime) * 100));
});

// Navigation vers la page de détails
const navigateToDetails = () => {
  router.push({ 
    name: 'details', 
    params: { 
      id: props.item.Id,
      type: props.item.Type?.toLowerCase() || 'video'
    } 
  });
};
</script>

<style scoped>
.media-card {
  flex: 0 0 auto;
  width: 160px; /* Largeur fixe pour garder un rail uniforme */
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  text-align: left;
  color: var(--sao-text);
  font-family: var(--font-display);
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
}

/* 🎯 Effet "Target Lock" au focus (Clavier/TV) et au survol (Souris) */
.media-card:hover,
.media-card:focus-visible {
  transform: scale(1.05);
  z-index: 10;
}

.media-card:focus-visible .card-poster {
  box-shadow: 0 0 0 3px var(--sao-cyan), 0 0 20px var(--sao-cyan-glow);
}

.card-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3; /* Format Portrait strict */
  background-color: var(--sao-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.25s ease;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: var(--sao-text-secondary);
  background: linear-gradient(135deg, var(--sao-surface), var(--sao-surface-elevated));
}

/* Barre de progression en bas de l'image */
.progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.6);
}

.progress-bar {
  height: 100%;
  background-color: var(--sao-cyan);
  box-shadow: 0 0 8px var(--sao-cyan-glow);
  transition: width 0.3s ease;
}

.card-info {
  padding: 0 4px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--sao-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 2px 0 0 0;
}
</style>