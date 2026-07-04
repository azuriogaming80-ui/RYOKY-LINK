<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlaybackStore } from '@/stores/playback';
// On importera VideoPlayer juste après !
// import VideoPlayer from '@/components/player/VideoPlayer.vue';

const route = useRoute();
const router = useRouter();
const playback = usePlaybackStore();

onMounted(async () => {
  const itemId = route.params.id as string;
  // Permet de reprendre la lecture exactement là où Candy s'était arrêtée
  const startTicks = Number(route.query.ticks) || 0; 
  
  try {
    await playback.initPlayback(itemId, startTicks);
  } catch (error: any) {
    console.error('Erreur de lecture :', error.message);
    // Si la règle d'or bloque le fichier, on retourne au dashboard
    alert('Format non supporté en DirectPlay par le navigateur. Transcodage interdit par la politique RYOKY.');
    router.back();
  }
});

onBeforeUnmount(async () => {
  // Nettoyage crucial quand on quitte la page ou qu'on change de vidéo
  await playback.stopPlayback();
});
</script>

<template>
  <div class="player-container">
    <!-- Le vrai player Video.js viendra se brancher ici -->
    <!-- <VideoPlayer v-if="playback.playbackUrl" :src="playback.playbackUrl" /> -->
    
    <div v-else class="loading-sao">
      <span>Initialisation du flux DirectPlay... ⏳</span>
    </div>
  </div>
</template>

<style scoped>
.player-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--sao-bg, #050505);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.loading-sao {
  color: var(--sao-cyan, #00ffff);
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>