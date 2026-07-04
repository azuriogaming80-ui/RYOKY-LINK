<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import screenfull from 'screenfull';
import { usePlaybackStore } from '@/stores/playback';

const playback = usePlaybackStore();
const videoElement = ref<HTMLVideoElement | null>(null);

// Typage safe pour éviter les erreurs de build selon la version de Video.js
let player: ReturnType<typeof videojs> | null = null; 
let lastReportTime = 0;

const THROTTLE_INTERVAL = 10000; // 10 secondes en ms pour le report API

onMounted(() => {
  if (!videoElement.value) return;

  // Initialisation de Video.js
  player = videojs(videoElement.value, {
    controls: false, // On cache les contrôles natifs moches, on fera les nôtres en Cyberpunk ! 🌃
    autoplay: false,
    preload: 'auto',
    fluid: true,
    userActions: {
      hotkeys: true, // Active quelques raccourcis natifs de base
    }
  });

  // 🔄 Événements Video.js
  player.on('play', () => {
    playback.reportProgress(false);
  });

  player.on('pause', () => {
    playback.reportProgress(true);
  });

  player.on('ended', () => {
    playback.stopPlayback();
    // TODO: Plus tard, on pourra trigger l'épisode suivant pour les marathons d'Aaron ! 🍿
  });

  // ⏱️ Télémétrie et Throttling
  player.on('timeupdate', () => {
    if (!player) return;
    const currentTimeSeconds = player.currentTime() || 0;
    const currentTimeTicks = Math.round(currentTimeSeconds * 10000000); // 1s = 10M Ticks
    
    // Mise à jour locale instantanée pour notre future barre de progression
    playback.positionTicks = currentTimeTicks;

    // Envoi à l'API seulement toutes les 10 secondes
    const now = Date.now();
    if (now - lastReportTime >= THROTTLE_INTERVAL) {
      playback.reportProgress(false);
      lastReportTime = now;
    }
  });
});

onBeforeUnmount(() => {
  // 🚨 CRUCIAL : Nettoyage de l'instance pour éviter les fuites de mémoire énormes
  if (player) {
    player.dispose();
    player = null;
  }
  // Désactivation du plein écran si actif pour éviter les bugs de navigation
  if (screenfull.isEnabled && screenfull.isFullscreen) {
    screenfull.exit();
  }
});

// 👀 Watcher pour injecter l'URL du stream dès qu'elle est prête dans le store
watch(() => playback.playbackUrl, (newUrl) => {
  if (player && newUrl) {
    // Détermination du type MIME (Video.js en a besoin pour initialiser le décodeur)
    let type = 'video/mp4';
    if (newUrl.includes('.m3u8')) type = 'application/x-mpegURL';
    else if (newUrl.includes('.mkv')) type = 'video/x-matroska';

    player.src({ src: newUrl, type });
    player.load();
  }
}, { immediate: true });

// 📺 Expose pour le futur PlayerControls.vue
function toggleFullscreen() {
  if (screenfull.isEnabled && videoElement.value) {
    // On prend le parent (.player-wrapper) pour que les overlays (contrôles) restent visibles en fullscreen
    const container = videoElement.value.closest('.player-wrapper') as HTMLElement;
    if (container) {
      screenfull.toggle(container);
    } else {
      screenfull.toggle(videoElement.value);
    }
  }
}

defineExpose({
  toggleFullscreen,
  getPlayer: () => player
});
</script>

<template>
  <!-- Le wrapper est important pour le fullscreen et les futurs overlays -->
  <div class="player-wrapper video-container">
    <video 
      ref="videoElement" 
      class="video-js vjs-default-skin"
      playsinline
    ></video>
  </div>
</template>

<style scoped>
.player-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
}

/* On s'assure que Video.js prend toute la place */
:deep(.video-js) {
  width: 100%;
  height: 100%;
}

/* Masquer le gros bouton play natif de Video.js au centre */
:deep(.vjs-big-play-button) {
  display: none;
}
</style>