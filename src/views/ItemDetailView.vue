<!-- src/views/ItemDetailView.vue -->
<template>
  <div class="item-detail" v-if="!itemStore.isLoading && itemStore.item">
    <button class="back" @click="goBack">< RETOUR</button>
    
    <div class="detail-hero">
      <div class="hero-backdrop">
        <img v-if="backdropUrl" :src="backdropUrl" :alt="itemStore.item.name" class="backdrop-image" />
        <div class="backdrop-gradient" />
      </div>
      <div class="hero-content">
        <div class="hero-poster" v-if="posterUrl">
          <img :src="posterUrl" :alt="itemStore.item.name" />
        </div>
        <div class="hero-info">
          <MediaInfo 
            :item="itemStore.item" 
            :year="itemStore.yearDisplay" 
            :runtime="itemStore.runtimeMinutes" 
            :rating="itemStore.ratingDisplay" 
          />
          <ActionButtons 
            :is-favorite="itemStore.item.userData?.isFavorite"
            :is-played="itemStore.item.userData?.played"
            :play-label="playButtonLabel"
            @play="handlePlay"
            @toggle-favorite="itemStore.toggleFavorite"
            @toggle-played="itemStore.markAsPlayed"
          />
        </div>
      </div>
    </div>

    <div class="detail-content">
      <Overview :overview="itemStore.item.overview" />
      <CastList :cast="itemStore.actors" />
      <SeasonList 
        v-if="itemStore.isSeries || itemStore.isEpisode"
        :seasons="itemStore.seasons"
        :episodes="itemStore.episodesForSelectedSeason"
        :selected-index="itemStore.selectedSeasonIndex"
        @select-season="itemStore.selectSeason"
        @play-episode="handlePlayEpisode"
      />
      <RelatedItems 
        :items="itemStore.similarItems" 
        @select="goToItem" 
      />
    </div>
  </div>

  <div v-else-if="itemStore.isLoading" class="detail-loading">
    <div class="loading-spinner" />
    <span>Chargement...</span>
  </div>

  <div v-else-if="itemStore.error" class="detail-error">
    <span class="error-icon">⚠</span>
    <p>{{ itemStore.error }}</p>
    <button class="retry-btn" @click="loadCurrentItem">Réessayer</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemDetailStore } from '@/stores/itemDetail';
import { useImageUrl } from '@/composables/useImageUrl';
import MediaInfo from '@/components/media/MediaInfo.vue';
import ActionButtons from '@/components/detail/ActionButtons.vue';
import Overview from '@/components/detail/Overview.vue';
import CastList from '@/components/detail/CastList.vue';
import SeasonList from '@/components/detail/SeasonList.vue';
import RelatedItems from '@/components/detail/RelatedItems.vue';
import type { BaseItemDto, EpisodeDto } from '@/types/item';

const route = useRoute();
const router = useRouter();
const itemStore = useItemDetailStore();
const { getBackdropUrl, getPrimaryImageUrl } = useImageUrl();

const backdropUrl = computed(() => {
  if (!itemStore.item?.backdropImageTags?.[0]) return '';
  return getBackdropUrl(itemStore.item.id, {
    width: 1920,
    tag: itemStore.item.backdropImageTags[0],
  });
});

const posterUrl = computed(() => {
  if (!itemStore.item?.imageTags?.Primary) return '';
  return getPrimaryImageUrl(itemStore.item.id, {
    width: 400,
    tag: itemStore.item.imageTags.Primary,
  });
});

const playButtonLabel = computed(() => {
  if (!itemStore.item) return 'Lecture';
  
  if (itemStore.isSeries) {
    const resumeEp = itemStore.episodes.find(
      ep => ep.userData?.playbackPositionTicks && ep.userData.playbackPositionTicks > 0 && !ep.userData?.played
    );
    const nextEp = itemStore.episodes.find(
      ep => !ep.userData?.played && (!ep.userData?.playbackPositionTicks || ep.userData.playbackPositionTicks === 0)
    );
    const target = resumeEp || nextEp;
    if (target) return `S${target.parentIndexNumber}E${target.indexNumber}`;
    return 'Lire la série';
  }
  
  if (itemStore.item.userData?.playbackPositionTicks && itemStore.item.userData.playbackPositionTicks > 0 && !itemStore.item.userData?.played) {
    return 'Reprendre';
  }
  return 'Lecture';
});

function loadCurrentItem() {
  const itemId = route.params.id as string;
  if (itemId) {
    itemStore.loadItem(itemId);
  }
}

onMounted(loadCurrentItem);
watch(() => route.params.id, loadCurrentItem);

function goBack() {
  router.back();
}

function goToItem(item: BaseItemDto) {
  router.push({ name: 'item', params: { id: item.id } });
}

function handlePlay() {
  if (!itemStore.item) return;

  if (itemStore.isMovie || itemStore.isEpisode) {
    const startTicks = itemStore.item.userData?.playbackPositionTicks || 0;
    router.push({
      name: 'player',
      params: { id: itemStore.item.id }, // ✅ Utilisation de params pour le routeur
      query: startTicks > 0 ? { ticks: startTicks } : undefined
    });
    return;
  }

  if (itemStore.isSeries) {
    const resumeEp = itemStore.episodes.find(
      ep => ep.userData?.playbackPositionTicks && ep.userData.playbackPositionTicks > 0 && !ep.userData?.played
    );
    const nextEp = itemStore.episodes.find(
      ep => !ep.userData?.played && (!ep.userData?.playbackPositionTicks || ep.userData.playbackPositionTicks === 0)
    );
    const target = resumeEp || nextEp || itemStore.episodes[0];
    
    if (target) {
      const startTicks = target.userData?.playbackPositionTicks || 0;
      router.push({
        name: 'player',
        params: { id: target.id },
        query: startTicks > 0 ? { ticks: startTicks } : undefined
      });
    }
  }
}

function handlePlayEpisode(episode: EpisodeDto) {
  const startTicks = episode.userData?.playbackPositionTicks || 0;
  router.push({
    name: 'player',
    params: { id: episode.id },
    query: startTicks > 0 ? { ticks: startTicks } : undefined
  });
}
</script>

<style scoped>
/* (Garde ton CSS actuel ici, il est parfait !) */
.item-detail { min-height: 100vh; background: var(--sao-bg); color: var(--sao-text); }
.back { position: fixed; top: 16px; left: 16px; z-index: 100; background: transparent; border: 1px solid var(--sao-dim); color: var(--sao-amber); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600; backdrop-filter: blur(10px); transition: all 0.2s ease; }
.back:hover { border-color: var(--sao-amber); box-shadow: 0 0 10px rgba(255, 200, 0, 0.2); }
.detail-hero { position: relative; min-height: 60vh; display: flex; flex-direction: column; justify-content: flex-end; }
.hero-backdrop { position: absolute; inset: 0; z-index: 0; }
.backdrop-image { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
.backdrop-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10, 10, 15, 0.3) 0%, rgba(10, 10, 15, 0.6) 40%, var(--sao-bg) 100%); }
.hero-content { position: relative; z-index: 1; display: flex; align-items: flex-end; gap: 24px; padding: 0 16px 32px; max-width: 1200px; margin: 0 auto; width: 100%; }
.hero-poster { width: 200px; flex-shrink: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); }
.hero-poster img { width: 100%; height: auto; display: block; }
.hero-info { flex: 1; min-width: 0; padding-bottom: 8px; }
.detail-content { max-width: 1200px; margin: 0 auto; padding: 24px 0 48px; }
.detail-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--sao-dim); }
.loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(0, 255, 255, 0.1); border-top-color: var(--sao-cyan); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.detail-error { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--sao-dim); text-align: center; padding: 24px; }
.error-icon { font-size: 3rem; }
.retry-btn { background: var(--sao-cyan); color: var(--sao-bg); border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; }
@media (max-width: 768px) {
  .detail-hero { min-height: 50vh; }
  .hero-content { flex-direction: column; align-items: flex-start; gap: 16px; padding-bottom: 24px; }
  .hero-poster { width: 120px; align-self: center; }
  .back { top: 8px; left: 8px; padding: 6px 12px; font-size: 0.8rem; }
}
@media (max-width: 480px) { .hero-poster { display: none; } }
</style>