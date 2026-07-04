<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue';

// Props reçues du parent (PlayerView ou VideoPlayer)
const props = defineProps<{
  isPlaying: boolean;
  currentTime: number; // en secondes
  duration: number;    // en secondes
}>();

// Événements envoyés au parent pour contrôler Video.js
const emit = defineEmits<{
  (e: 'toggle-play'): void;
  (e: 'seek', time: number): void;
  (e: 'toggle-fullscreen'): void;
  (e: 'go-back'): void;
}>();

const showControls = ref(true);
const isSeeking = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

// 🪄 Logique d'Auto-Hide (3 secondes)
function resetTimer() {
  showControls.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  
  // On ne masque que si la vidéo est en cours de lecture
  if (props.isPlaying) {
    hideTimer = setTimeout(() => {
      showControls.value = false;
    }, 3000);
  }
}

// Formater le temps en HH:MM:SS ou MM:SS
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const progressPercent = computed(() => {
  if (!props.duration) return 0;
  return (props.currentTime / props.duration) * 100;
});

// Gestion du clic sur la barre de progression (Seek)
function handleScrubClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * props.duration;
  emit('seek', newTime);
}

// Watcher pour relancer le timer si l'état de lecture change
watch(() => props.isPlaying, () => {
  resetTimer();
});

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<template>
  <div 
    class="controls-wrapper" 
    :class="{ 'is-hidden': !showControls && isPlaying }"
    @mousemove="resetTimer"
    @mouseleave="showControls = false"
    @click="resetTimer"
  >
    <!-- 🌃 TOP BAR : Titre et Retour -->
    <div class="top-bar">
      <button class="btn-icon btn-back" @click="emit('go-back')" title="Retour">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2 class="media-title">Titre du Média (À lier avec le Store)</h2>
    </div>

    <!-- ⚡ CENTER ZONE : Bouton Play/Pause Central -->
    <div class="center-zone" @click.stop="emit('toggle-play')">
      <transition name="fade">
        <button v-if="!isPlaying || showControls" class="btn-play-central">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="80" height="80"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="80" height="80"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
      </transition>
    </div>

    <!-- 📊 BOTTOM BAR : Le Cockpit (Glassmorphism) -->
    <div class="bottom-bar" @click.stop>
      <!-- Barre de progression custom -->
      <div class="progress-container" @click="handleScrubClick">
        <div class="progress-buffer" style="width: 100%;"></div>
        <div class="progress-played" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
      </div>

      <div class="bottom-actions">
        <button class="btn-icon" @click="emit('toggle-play')">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>

        <span class="timecode">
          {{ formatTime(currentTime) }} <span class="separator">/</span> {{ formatTime(duration) }}
        </span>

        <div class="spacer"></div>

        <button class="btn-icon" @click="emit('toggle-fullscreen')" title="Plein écran">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
  cursor: default;
  transition: opacity 0.4s ease, visibility 0.4s ease;
  /* Dégradé subtil pour la lisibilité du texte sur la vidéo */
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.8) 100%);
}

.controls-wrapper.is-hidden {
  opacity: 0;
  visibility: hidden;
  cursor: none; /* Masque le curseur en mode cinéma ! 🎬 */
}

/* 🌃 TOP BAR */
.top-bar {
  display: flex;
  align-items: center;
  padding: 20px 30px;
  gap: 15px;
}
.media-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

/* ⚡ CENTER ZONE */
.center-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-play-central {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid var(--sao-cyan, #00ffff);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sao-cyan, #00ffff);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  transition: all 0.2s;
  backdrop-filter: blur(5px);
}
.btn-play-central:hover {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
}

/* 📊 BOTTOM BAR (Glassmorphism) */
.bottom-bar {
  padding: 15px 30px 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Effet verre dépoli Cyberpunk */
  background: rgba(10, 10, 15, 0.5);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

/* Progress Bar Custom */
.progress-container {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
  transition: height 0.2s;
}
.progress-container:hover {
  height: 10px;
}
.progress-played {
  position: absolute;
  height: 100%;
  background: var(--sao-cyan, #00ffff);
  border-radius: 3px;
  box-shadow: 0 0 8px var(--sao-cyan, #00ffff);
  transition: width 0.1s linear;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid var(--sao-cyan, #00ffff);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}
.progress-container:hover .progress-thumb {
  opacity: 1;
}

.bottom-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
}
.spacer { flex: 1; }
.timecode {
  font-family: monospace;
  font-size: 0.9rem;
  letter-spacing: 1px;
  color: var(--sao-amber, #ffbf00); /* Ambre pour le temps, contraste parfait avec le Cyan */
}
.separator { opacity: 0.5; margin: 0 4px; }

/* Boutons Icones */
.btn-icon {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-icon:hover {
  color: var(--sao-cyan, #00ffff);
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

/* Transitions Vue */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>