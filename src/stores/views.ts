import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jellyfinApi } from '@/services/jellyfin-api'
import { useAuthStore } from './auth'
import { mapJellyfinView } from '@/utils/jellyfin-mapper'
import type { JellyfinView } from '@/types'

export const useViewsStore = defineStore('views', () => {
  const auth = useAuthStore()

  const views = ref<JellyfinView[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const MANGA_KEYWORDS = ['manga', 'anime', 'animation japonaise', 'japanimation']

  const movieViews = computed(() => views.value.filter(v => v.collectionType === 'movies'))
  const tvViews = computed(() => views.value.filter(v => v.collectionType === 'tvshows'))
  const mangaViews = computed(() =>
    views.value.filter(
      v => v.isManga || MANGA_KEYWORDS.some(k => v.name.toLowerCase().includes(k))
    )
  )
  const otherViews = computed(() =>
    views.value.filter(
      v => !movieViews.value.includes(v) && !tvViews.value.includes(v) && !mangaViews.value.includes(v)
    )
  )

  async function fetchViews() {
    if (!auth.userId) return
    isLoading.value = true
    error.value = null
    try {
      const data = await jellyfinApi.getViews(auth.userId)
      views.value = (data.Items || []).map((v: any) => {
        const mapped = mapJellyfinView(v)
        mapped.isManga = MANGA_KEYWORDS.some(k => mapped.name.toLowerCase().includes(k))
        return mapped
      })
    } catch (e) {
      error.value = String(e)
    } finally {
      isLoading.value = false
    }
  }

  return { views, isLoading, error, movieViews, tvViews, mangaViews, otherViews, fetchViews }
})