// src/stores/dashboard.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jellyfinApi } from '@/services/jellyfin-api'
import { useAuthStore } from './auth'
import { mapBaseItemDto } from '@/utils/mapper'
import type { BaseItemDto } from '@/types'

interface RecentlyAddedData {
  name: string
  items: BaseItemDto[]
}

export const useDashboardStore = defineStore('dashboard', () => {
  const auth = useAuthStore()

  const resumeVideo = ref<BaseItemDto[]>([])
  const resumeAudio = ref<BaseItemDto[]>([])
  const resumeBooks = ref<BaseItemDto[]>([])
  const nextUp = ref<BaseItemDto[]>([])
  const recentlyAdded = ref(new Map<string, RecentlyAddedData>())

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const allResume = computed(() => [...resumeVideo.value, ...resumeAudio.value, ...resumeBooks.value])

  async function fetchDashboard() {
    if (!auth.userId) return
    isLoading.value = true
    error.value = null
    try {
      // ⚡ Batch loading : on lance toutes les requêtes en parallèle
      const [video, audio, books, next] = await Promise.all([
        jellyfinApi.getResumeItems(auth.userId, 'Video'),
        jellyfinApi.getResumeItems(auth.userId, 'Audio'),
        jellyfinApi.getResumeItems(auth.userId, 'Book'),
        jellyfinApi.getNextUp(auth.userId, { limit: 24 }),
      ])
      
      resumeVideo.value = (video || []).map(mapBaseItemDto)
      resumeAudio.value = (audio || []).map(mapBaseItemDto)
      resumeBooks.value = (books || []).map(mapBaseItemDto)
      nextUp.value = (next || []).map(mapBaseItemDto)
    } catch (e) {
      console.error('Dashboard fetch error:', e)
      error.value = String(e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecentlyAddedForView(viewId: string, viewName: string) {
    if (!auth.userId) return
    try {
      const items = await jellyfinApi.getRecentlyAdded(auth.userId, viewId, 16)
      recentlyAdded.value.set(viewId, { name: viewName, items: (items || []).map(mapBaseItemDto) })
      // Force reactivity update for Map
      recentlyAdded.value = new Map(recentlyAdded.value)
    } catch (e) {
      console.error(`Failed to fetch recently added for ${viewName}:`, e)
    }
  }

  return {
    resumeVideo,
    resumeAudio,
    resumeBooks,
    nextUp,
    recentlyAdded,
    isLoading,
    error,
    allResume,
    fetchDashboard,
    fetchRecentlyAddedForView,
  }
})