// src/stores/dashboard.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { jellyfinApi } from '@/services/jellyfin-api';
import { useAuthStore } from './auth';

export interface DashboardRail {
  id: string;
  title: string;
  type: 'resume' | 'recent' | 'suggestions';
  items: any[];
  viewId: string;
  viewName: string;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const rails = ref<DashboardRail[]>([]);
  const isLoading = ref(false);

  async function fetchDashboard() {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return;

    isLoading.value = true;
    rails.value = [];

    try {
      // 1. Récupération des bibliothèques (Views) de l'utilisateur
      const views = await jellyfinApi.getViews(auth.userId);
      const allRails: DashboardRail[] = [];

      // 2. Pour chaque bibliothèque, on génère les rails
      for (const view of views) {
        // Appels parallèles pour optimiser la vitesse de chargement
        const [resumeRes, recentRes] = await Promise.all([
          jellyfinApi.getItems({
            userId: auth.userId,
            parentId: view.Id,
            filters: 'IsResumable',
            sortBy: 'DatePlayed',
            sortOrder: 'Descending',
            limit: 20,
            recursive: true,
            fields: ['PrimaryImageAspectRatio', 'BasicSyncInfo', 'CanDelete', 'MediaSourceCount', 'SeriesName', 'SeasonName'],
            imageTypeLimit: 1,
            enableImageTypes: ['Primary']
          }),
          jellyfinApi.getRecentlyAdded(auth.userId, view.Id, 20)
        ]);

        const resumeItems = resumeRes.Items || [];
        const recentItems = recentRes || [];

        // 🎯 Rail 1 : Reprendre la lecture
        if (resumeItems.length > 0) {
          allRails.push({
            id: `${view.Id}-resume`,
            title: `${view.Name} - Reprendre la lecture`,
            type: 'resume',
            items: resumeItems,
            viewId: view.Id,
            viewName: view.Name
          });
        }

        // 🎯 Rail 2 : Ajouts Récents
        if (recentItems.length > 0) {
          allRails.push({
            id: `${view.Id}-recent`,
            title: `${view.Name} - Ajouts Récents`,
            type: 'recent',
            items: recentItems,
            viewId: view.Id,
            viewName: view.Name
          });
        }

        // 🎯 Rail 3 : Suggestions (En attendant ton LLM, on prend des items aléatoires non vus)
        const suggestionsRes = await jellyfinApi.getItems({
          userId: auth.userId,
          parentId: view.Id,
          sortBy: 'Random',
          sortOrder: 'Descending',
          limit: 20,
          recursive: true,
          filters: 'IsUnplayed',
          fields: ['PrimaryImageAspectRatio', 'BasicSyncInfo'],
          imageTypeLimit: 1,
          enableImageTypes: ['Primary']
        });
        
        const suggestions = suggestionsRes.Items || [];
        if (suggestions.length > 0) {
          allRails.push({
            id: `${view.Id}-suggestions`,
            title: `${view.Name} - Suggestions`,
            type: 'suggestions',
            items: suggestions,
            viewId: view.Id,
            viewName: view.Name
          });
        }
      }

      // Mise à jour de l'état réactif
      rails.value = allRails;
    } catch (error) {
      console.error('[RYOKY] Erreur chargement dashboard:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    rails,
    isLoading,
    fetchDashboard
  };
});