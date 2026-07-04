<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlaybackStore } from '@/stores/playback';
import VideoPlayer from '@/components/player/VideoPlayer.vue';
import PlayerControls from '@/components/player/PlayerControls.vue';
import { useMediaSegments } from '@/composables/useMediaSegments';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

const route = useRoute();
const router = useRouter();
const playback = usePlaybackStore();

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);
const itemId = route.params.id as string;

// 🎨 State local pour l'UI (synchronisé avec Video.js)
const isPlaying = ref(false);
const currentTime = ref(0); // en secondes
const duration = ref(0);    // en secondes

// ⏭️ 1. Initialisation du Chasseur d'Intros/Outros
const { activeSegment, getSkipTime } = useMediaSegments(
  itemId, 
  () => playback.positionTicks // Passé en getter pour une réactivité parfaite
);

// 🚀 2. Cycle de vie et Initialisation du Stream
onMounted(async () => {
  try {
    const startTicks = Number(route.query.ticks) || 0;
    await playback.initPlayback(itemId, startTicks);
    
    // Récupération de la durée totale depuis les métadonnées Jellyfin
    if (playback.currentItem?.RunTimeTicks) {
      duration.value = playback.currentItem.RunTimeTicks / 10000000;
    }
  } catch (error: any) {
    console.error('[RYOKY] Erreur de lecture :', error);
    alert(error.message || 'Format non supporté en DirectPlay.');
    router.back();
  }
});

onBeforeUnmount(async () => {
  // 🛡️ Nettoyage crucial de la session Jellyfin
  await playback.stopPlayback();
});

// 🔄 3. Synchronisation du temps (Store -> UI)
watch(() => playback.positionTicks, (ticks) => {
  currentTime.value = ticks / 10000000;
});

// 🎮 4. Handlers pour les Contrôles et le Clavier
const togglePlay = () => {
  const player = videoPlayerRef.value?.getPlayer();
  if (player) {
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  }
};

const seek = (offset: number) => {
  const player = videoPlayerRef.value?.getPlayer();
  if (player) {
    player.currentTime(player.currentTime() + offset);
  }
};

const toggleFullscreen = () => {
  videoPlayerRef.value?.toggleFullscreen();
};

const goBack = () => {
  router.back();
};

const handleSkip = () => {
  const skipTime = getSkipTime();
  const player = videoPlayerRef.value?.getPlayer();
  if (skipTime !== null && player) {
    player.currentTime(skipTime);
  }
};

// ⌨️ 5. Activation des Raccourcis Clavier
useKeyboardShortcuts({
  togglePlay,
  seek,
  toggleFullscreen
});

// 🔗 6. Écoute des événements natifs de Video.js pour sync l'UI
watch(videoPlayerRef, (newRef) => {
  if (newRef) {
    const player = newRef.getPlayer();
    if (player) {
      player.on('play', () => { isPlaying.value = true; });
      player.on('pause', () => { isPlaying.value = false; });
      player.on('ended', () => { 
        isPlaying.value = false;
        // TODO: Plus tard, on pourra trigger l'épisode suivant ici !
        router.back(); 
      });
    }
  }
});
</script>

<template>
  <div class="player-view">
    <!-- Le Moteur Vidéo -->
    <VideoPlayer ref="videoPlayerRef" />
    
    <!-- Le Cockpit (Interface Cyberpunk) -->
    <PlayerControls 
      v-if="duration > 0"
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      @toggle-play="togglePlay"
      @seek="(time) => videoPlayerRef?.getPlayer()?.currentTime(time)"
      @toggle-fullscreen="toggleFullscreen"
      @go-back="goBack"
    />

    <!-- ⏭️ Overlay Skip Segment (Intro/Outro) -->
    <transition name="slide-up">
      <button 
        v-if="activeSegment" 
        class="skip-button"
        @click="handleSkip"
      >
        Passer {{ activeSegment.type === 'intro' ? 'l\'intro' : 'la fin' }} ⏭️
      </button>
    </transition>
  </div>
</template>

<style scoped>
.player-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

/* 🌃 Le Bouton Skip Style SAO */
.skip-button {
  position: absolute;
  bottom: 100px;
  right: 40px;
  z-index: 20;
  padding: 12px 24px;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid var(--sao-cyan, #00ffff);
  color: var(--sao-cyan, #00ffff);
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.skip-button:hover {
  background: var(--sao-cyan, #00ffff);
  color: #000;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
  transform: scale(1.05);
}

/* Animations Vue */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>