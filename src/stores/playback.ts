import { defineStore } from 'pinia';
import { ref } from 'vue';
import { jellyfinApi } from '@/services/jellyfin-api';
import { useAuthStore } from './auth';

export const usePlaybackStore = defineStore('playback', () => {
  const auth = useAuthStore();

  const currentItem = ref<any>(null);
  const mediaSource = ref<any>(null);
  const playSessionId = ref<string>('');
  const playbackUrl = ref<string>('');
  const positionTicks = ref<number>(0);

  async function initPlayback(itemId: string, startTicks: number = 0) {
    // 1. Récupération des infos de lecture et des MediaSources
    const { data } = await jellyfinApi.post(`/Items/${itemId}/PlaybackInfo`, {
      UserId: auth.userId,
      StartTimeTicks: startTicks,
      AutoOpenLiveStream: true,
    });

    currentItem.value = data.Item || { Id: itemId };
    mediaSource.value = data.MediaSources?.[0] || null;
    playSessionId.value = data.PlaySessionId || '';

    // 2. APPLICATION DE LA RÈGLE D'OR : ZÉRO TRANSCODAGE 🛡️
    if (!mediaSource.value?.SupportsDirectPlay) {
      throw new Error('RYOKY_POLICY: Le format nécessite un transcodage. Lecture refusée.');
    }

    // 3. Génération de l'URL DirectPlay 
    // (Le token est en query string car la balise HTML <video> ne gère pas les headers custom)
    const apiKey = auth.accessToken;
    const baseUrl = jellyfinApi.defaults.baseURL;
    playbackUrl.value = `${baseUrl}/Videos/${itemId}/stream?static=true&MediaSourceId=${mediaSource.value.Id}&api_key=${apiKey}`;

    // 4. Report du démarrage de la session à Jellyfin
    await reportPlaybackStart(startTicks);
  }

  async function reportPlaybackStart(ticks: number = 0) {
    if (!playSessionId.value) return;
    await jellyfinApi.post('/Sessions/Playing', {
      ItemId: currentItem.value.Id,
      MediaSourceId: mediaSource.value?.Id,
      PlaySessionId: playSessionId.value,
      PositionTicks: ticks,
      IsPaused: false,
      PlayMethod: 'DirectPlay',
    });
  }

  async function reportProgress(isPaused: boolean = false) {
    if (!playSessionId.value) return;
    await jellyfinApi.post('/Sessions/Playing/Progress', {
      ItemId: currentItem.value.Id,
      MediaSourceId: mediaSource.value?.Id,
      PlaySessionId: playSessionId.value,
      PositionTicks: positionTicks.value,
      IsPaused: isPaused,
      PlayMethod: 'DirectPlay',
    });
  }

  async function stopPlayback() {
    if (!playSessionId.value) return;
    
    // On dit à Jellyfin qu'on a fini (pour marquer l'épisode comme "Vu" si on est assez loin)
    await jellyfinApi.post('/Sessions/Playing/Stopped', {
      ItemId: currentItem.value.Id,
      MediaSourceId: mediaSource.value?.Id,
      PlaySessionId: playSessionId.value,
      PositionTicks: positionTicks.value,
    });
    
    // Reset complet du store pour éviter les sessions fantômes
    currentItem.value = null;
    mediaSource.value = null;
    playSessionId.value = '';
    playbackUrl.value = '';
  }

  return {
    currentItem, mediaSource, playSessionId, playbackUrl, positionTicks,
    initPlayback, reportProgress, stopPlayback
  };
});