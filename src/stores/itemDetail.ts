// src/stores/itemDetail.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jellyfinApi } from '@/services/jellyfin-api';
import { useAuthStore } from './auth';
import type { BaseItemDto, BaseItemPerson, SeasonDto, EpisodeDto } from '@/types/item';

export const useItemDetailStore = defineStore('itemDetail', () => {
  const auth = useAuthStore();

  // ========== STATE ==========
  const item = ref<BaseItemDto | null>(null);
  const seasons = ref<SeasonDto[]>([]);
  const episodes = ref<EpisodeDto[]>([]);
  const cast = ref<BaseItemPerson[]>([]);
  const similarItems = ref<BaseItemDto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedSeasonIndex = ref<number>(0);

  // ========== GETTERS ==========
  const isMovie = computed(() => item.value?.type === 'Movie');
  const isSeries = computed(() => item.value?.type === 'Series');
  const isEpisode = computed(() => item.value?.type === 'Episode');
  
  const runtimeMinutes = computed(() => {
    if (!item.value?.runTimeTicks) return null;
    return Math.round(item.value.runTimeTicks / 10_000_000 / 60);
  });

  const yearDisplay = computed(() => {
    if (item.value?.productionYear) return item.value.productionYear;
    if (item.value?.year) return item.value.year;
    if (item.value?.premiereDate) {
      return new Date(item.value.premiereDate).getFullYear();
    }
    return null;
  });

  const ratingDisplay = computed(() => {
    if (item.value?.communityRating) {
      return item.value.communityRating.toFixed(1);
    }
    return null;
  });

  const selectedSeason = computed(() => {
    if (seasons.value.length === 0) return null;
    return seasons.value[selectedSeasonIndex.value] || seasons.value[0];
  });

  const episodesForSelectedSeason = computed(() => {
    if (!selectedSeason.value) return [];
    return episodes.value.filter(
      ep => ep.parentIndexNumber === selectedSeason.value?.indexNumber
    );
  });

  const directors = computed(() => 
    cast.value.filter(p => p.type === 'Director')
  );
  
  const writers = computed(() => 
    cast.value.filter(p => p.type === 'Writer')
  );
  
  const actors = computed(() => 
    cast.value.filter(p => p.type === 'Actor' || p.type === 'GuestStar')
  );

  // ========== ACTIONS ==========
  async function loadItem(itemId: string) {
    if (!auth.userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    // Reset
    item.value = null;
    seasons.value = [];
    episodes.value = [];
    cast.value = [];
    similarItems.value = [];
    selectedSeasonIndex.value = 0;

    try {
      // 1. Charger l'item principal (déjà mappé en camelCase par le service)
      const itemData = await jellyfinApi.getItem(auth.userId, itemId);
      item.value = itemData;

      // 2. Extraire le cast depuis l'item (people est maintenant en camelCase)
      cast.value = itemData.people || [];

      // 3. Charger les détails spécifiques au type en parallèle
      const promises: Promise<any>[] = [];

      // Items similaires (pour tous)
      promises.push(
        jellyfinApi.getSimilarItems(auth.userId, itemId).then(data => {
          similarItems.value = data || [];
        }).catch(() => { similarItems.value = []; })
      );

      // Si c'est une série → charger les saisons
      if (itemData.type === 'Series') {
        promises.push(
          jellyfinApi.getSeasons(itemId, auth.userId).then(data => {
            seasons.value = (data.items || []).sort(
              (a: SeasonDto, b: SeasonDto) => (a.indexNumber || 0) - (b.indexNumber || 0)
            );
            // Charger les épisodes de la première saison
            if (seasons.value.length > 0) {
              return loadEpisodesForSeason(0);
            }
          }).catch(() => { seasons.value = []; })
        );
      }

      // Si c'est une saison → charger les épisodes
      if (itemData.type === 'Season') {
        promises.push(
          jellyfinApi.getEpisodes(itemData.seriesId!, itemId, auth.userId).then(data => {
            episodes.value = data.items || [];
          }).catch(() => { episodes.value = []; })
        );
        // Charger aussi les saisons de la série
        if (itemData.seriesId) {
          promises.push(
            jellyfinApi.getSeasons(itemData.seriesId, auth.userId).then(data => {
              seasons.value = (data.items || []).sort(
                (a: SeasonDto, b: SeasonDto) => (a.indexNumber || 0) - (b.indexNumber || 0)
              );
              const currentSeasonNum = itemData.indexNumber || 1;
              const idx = seasons.value.findIndex(s => s.indexNumber === currentSeasonNum);
              selectedSeasonIndex.value = idx >= 0 ? idx : 0;
            }).catch(() => { seasons.value = []; })
          );
        }
      }

      // Si c'est un épisode → charger les épisodes de la saison + saisons de la série
      if (itemData.type === 'Episode' && itemData.seasonId) {
        promises.push(
          jellyfinApi.getEpisodes(itemData.seriesId!, itemData.seasonId, auth.userId).then(data => {
            episodes.value = data.items || [];
          }).catch(() => { episodes.value = []; })
        );
        if (itemData.seriesId) {
          promises.push(
            jellyfinApi.getSeasons(itemData.seriesId, auth.userId).then(data => {
              seasons.value = (data.items || []).sort(
                (a: SeasonDto, b: SeasonDto) => (a.indexNumber || 0) - (b.indexNumber || 0)
              );
              const currentSeasonNum = itemData.parentIndexNumber || 1;
              const idx = seasons.value.findIndex(s => s.indexNumber === currentSeasonNum);
              selectedSeasonIndex.value = idx >= 0 ? idx : 0;
            }).catch(() => { seasons.value = []; })
          );
        }
      }

      await Promise.all(promises);

    } catch (e) {
      error.value = String(e);
      console.error('Erreur chargement item:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadEpisodesForSeason(seasonIndex: number) {
    if (!auth.userId || !item.value) return;
    
    selectedSeasonIndex.value = seasonIndex;
    const season = seasons.value[seasonIndex];
    if (!season) return;

    // Si on a déjà les épisodes pour cette saison, on ne recharge pas
    const existing = episodes.value.filter(
      ep => ep.parentIndexNumber === season.indexNumber
    );
    if (existing.length > 0) return;

    try {
      const seriesId = isSeries.value ? item.value.id : item.value.seriesId;
      if (!seriesId) return;
      
      const data = await jellyfinApi.getEpisodes(seriesId, season.id, auth.userId);
      const newEpisodes = data.items || [];
      episodes.value = [...episodes.value, ...newEpisodes];
    } catch (e) {
      console.error('Erreur chargement épisodes:', e);
    }
  }

  async function toggleFavorite() {
    if (!auth.userId || !item.value) return;
    
    const newState = !item.value.userData?.isFavorite;
    await jellyfinApi.toggleFavorite(auth.userId, item.value.id, newState);
    
    if (!item.value.userData) item.value.userData = {};
    item.value.userData.isFavorite = newState;
  }

  async function markAsPlayed() {
    if (!auth.userId || !item.value) return;
    
    const newState = !item.value.userData?.played;
    await jellyfinApi.markPlayed(auth.userId, item.value.id, newState);
    
    if (!item.value.userData) item.value.userData = {};
    item.value.userData.played = newState;
  }

  function selectSeason(index: number) {
    selectedSeasonIndex.value = index;
    loadEpisodesForSeason(index);
  }

  return {
    // State
    item,
    seasons,
    episodes,
    cast,
    similarItems,
    isLoading,
    error,
    selectedSeasonIndex,
    // Getters
    isMovie,
    isSeries,
    isEpisode,
    runtimeMinutes,
    yearDisplay,
    ratingDisplay,
    selectedSeason,
    episodesForSelectedSeason,
    directors,
    writers,
    actors,
    // Actions
    loadItem,
    loadEpisodesForSeason,
    toggleFavorite,
    markAsPlayed,
    selectSeason,
  };
});