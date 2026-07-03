<template>
  <div class="dashboard">
    <MediaBanner
      v-if="carouselItems.length > 0"
      :items="carouselItems"
      @play="handlePlay"
      @detail="handleDetail"
    />
    <div class="dashboard-content">
      <PosterRow
        v-if="dashboardStore.resumeVideo.length > 0"
        label="Continuer à regarder"
        :posters="dashboardStore.resumeVideo"
        @select="handleDetail"
      />
      <PosterRow
        v-if="dashboardStore.nextUp.length > 0"
        label="Prochain épisode"
        :posters="dashboardStore.nextUp"
        @select="handleDetail"
      />
      <PosterRow
        v-for="[viewId, viewData] in recentlyAddedEntries"
        :key="viewId"
        :label="`Ajoutés récemment dans ${viewData.name}`"
        :posters="viewData.items"
        :layout="isMobile ? 'grid' : 'row'"
        @select="handleDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useViewsStore } from '@/stores/views'
import MediaBanner from '@/components/media/MediaBanner.vue'
import PosterRow from '@/components/media/PosterRow.vue'
import type { BaseItemDto } from '@/types'

const router = useRouter()
const dashboardStore = useDashboardStore()
const viewsStore = useViewsStore()

const isMobile = ref(window.innerWidth <= 768)
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})

const carouselItems = computed(() => [...dashboardStore.nextUp, ...dashboardStore.allResume].slice(0, 5))
const recentlyAddedEntries = computed(() => Array.from(dashboardStore.recentlyAdded.entries()))

onMounted(async () => {
  await dashboardStore.fetchDashboard()
  await viewsStore.fetchViews()
  for (const view of viewsStore.views) {
    await dashboardStore.fetchRecentlyAddedForView(view.id, view.name)
  }
})

function handleDetail(item: BaseItemDto) {
  router.push({ name: 'item', params: { id: item.id } })
}

function handlePlay(item: BaseItemDto) {
  if (item.type === 'Movie' || item.type === 'Episode') {
    router.push({ name: 'player', query: { itemId: item.id } })
  } else {
    handleDetail(item)
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--sao-bg);
  padding-bottom: 32px;
}
.dashboard-content {
  padding: 0;
}
@media (max-width: 768px) {
  .dashboard {
    overflow-x: hidden;
  }
}
</style>