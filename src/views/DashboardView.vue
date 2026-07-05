<template>
  <main class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="dashboard-welcome">
        Bienvenue, <span class="highlight">{{ auth.currentUser?.Name || 'Commandant' }}</span>
      </h1>
    </header>

    <!-- État de chargement -->
    <div v-if="dashboard.isLoading" class="loading-state">
      <div class="loader"></div>
      <p>Chargement de la médiathèque...</p>
    </div>

    <!-- État vide -->
    <div v-else-if="dashboard.rails.length === 0" class="empty-state">
      <p>Aucun média trouvé dans vos bibliothèques.</p>
    </div>

    <!-- Affichage des Rails -->
    <template v-else>
      <MediaRail 
        v-for="rail in dashboard.rails" 
        :key="rail.id"
        :title="rail.title"
        :items="rail.items"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth';
import { useFocusNav } from '@/composables/useFocusNav';
import MediaRail from '@/components/MediaRail.vue';

const dashboard = useDashboardStore();
const auth = useAuthStore();

// 🎮 Activation de la navigation au clavier pour la TV
useFocusNav();

onMounted(() => {
  dashboard.fetchDashboard();
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.dashboard-header {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-welcome {
  font-size: 2rem;
  font-weight: 300;
  color: var(--sao-text);
  margin: 0;
  letter-spacing: 1px;
}

.highlight {
  color: var(--sao-cyan);
  font-weight: 600;
  text-shadow: 0 0 10px var(--sao-cyan-glow);
}

/* Loader style SAO */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--sao-text-secondary);
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--sao-surface-elevated);
  border-top: 3px solid var(--sao-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  box-shadow: 0 0 15px var(--sao-cyan-glow);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--sao-text-secondary);
  font-size: 1.2rem;
}

/* Responsive Mobile */
@media (max-width: 768px) {
  .dashboard-welcome {
    font-size: 1.5rem;
  }
  .rail-title {
    font-size: 1.2rem;
  }
}
</style>