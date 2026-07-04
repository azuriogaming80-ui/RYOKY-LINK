<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import screenfull from 'screenfull';
import { usePlaybackStore } from '@/stores/playback';

const playback = usePlaybackStore();
const videoElement = ref<HTMLVideoElement | null>(null);

// Typage safe pour éviter les erreurs de build
let player: ReturnType<typeof videojs> | null = null; 
let lastReportTime = 0;

const THROTTLE_INTERVAL = 10000; // 10 secondes en ms

onMounted(() => {
  if (!videoElement.value) return;

  // Initialisation de Video.js
  player = videojs(videoElement.value, {
    controls: false, 
    autoplay: false,
    preload: 'auto',
    fluid: true,
    userActions: {
      hotkeys: true, 
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
  });

  // ⏱️ Télémétrie et Throttling
  player.on('timeupdate', () => {
    if (!player) return;
    const currentTimeSeconds = player.currentTime() || 0;
    const currentTimeTicks = Math.round(currentTimeSeconds * 10000000); 
    
    playback.positionTicks = currentTimeTicks;

    const now = Date.now();
    if (now - lastReportTime >= THROTTLE_INTERVAL) {
      playback.reportProgress(false);
      lastReportTime = now;
    }
  });
});

onBeforeUnmount(() => {
  // 🚨 Nettoyage de l'instance
  if (player) {
    player.dispose();
    player = null;
  }
  if (screenfull.isEnabled && screenfull.isFullscreen) {
    screenfull.exit();
  }
});

// 👀 Watcher pour injecter l'URL du stream
watch(() => playback.playbackUrl, (newUrl) => {
  if (player && newUrl) {
    let type = 'video/mp4';
    if (newUrl.includes('.m3u8')) type = 'application/x-mpegURL';
    else if (newUrl.includes('.mkv')) type = 'video/x-matroska';

    player.src({ src: newUrl, type });
    player.load();
  }
}, { immediate: true });

// 📺 Expose pour PlayerControls.vue
function toggleFullscreen() {
  if (screenfull.isEnabled && videoElement.value) {
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

:deep(.video-js) {
  width: 100%;
  height: 100%;
}

:deep(.vjs-big-play-button) {
  display: none;
}
</style>