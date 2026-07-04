import { ref, computed, watch } from 'vue';
import { jellyfinApi } from '@/services/jellyfin-api';

export interface MediaSegment {
  type: 'intro' | 'outro' | 'preview';
  startTicks: number;
  endTicks: number;
}

export function useMediaSegments(itemId: string, currentTimeTicks: number) {
  const segments = ref<MediaSegment[]>([]);

  // Récupération des segments via le plugin Intro Skipper
  async function fetchSegments() {
    try {
      // Le plugin Intro Skipper expose souvent ses données ici
      const { data } = await jellyfinApi.get(`/IntroSkipper/Segments/${itemId}`);
      
      if (data && Array.isArray(data)) {
        segments.value = data.map((seg: any) => ({
          type: (seg.SegmentType || seg.Type || 'intro').toLowerCase(),
          // Le plugin renvoie souvent des secondes, on convertit en Ticks (1s = 10M Ticks)
          startTicks: (seg.Start || seg.start) * 10000000,
          endTicks: (seg.End || seg.end) * 10000000,
        }));
      }
    } catch (error) {
      console.warn('[RYOKY] Plugin IntroSkipper non détecté ou erreur:', error);
      segments.value = []; // Fallback gracieux
    }
  }

  // Computed : Le segment actuellement en cours de lecture (s'il y en a un)
  const activeSegment = computed<MediaSegment | null>(() => {
    return segments.value.find(
      (seg) => currentTimeTicks >= seg.startTicks && currentTimeTicks < seg.endTicks
    ) || null;
  });

  // Action pour sauter le segment (à appeler depuis le bouton UI)
  function getSkipTime(): number | null {
    if (activeSegment.value) {
      return activeSegment.value.endTicks / 10000000; // Retourne en secondes pour Video.js
    }
    return null;
  }

  // Watcher pour fetch les segments dès que l'item change
  watch(() => itemId, () => {
    if (itemId) fetchSegments();
  }, { immediate: true });

  return {
    segments,
    activeSegment,
    getSkipTime,
  };
}