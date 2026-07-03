<!-- src/components/detail/SeasonList.vue -->
<template>
  <div v-if="seasons.length > 0" class="seasons-section">
    <h3 class="section-title">Épisodes</h3>
    
    <div class="season-tabs">
      <button
        v-for="(season, index) in seasons"
        :key="season.id"
        class="season-tab"
        :class="{ active: selectedIndex === index }"
        @click="$emit('selectSeason', index)"
      >
        S{{ season.indexNumber }}
      </button>
    </div>

    <div class="episodes-list">
      <div
        v-for="episode in episodes"
        :key="episode.id"
        class="episode-card"
        :class="{ watched: episode.userData?.played }"
        @click="$emit('playEpisode', episode)"
      >
        <div class="episode-thumb">
          <img
            v-if="episode.imageTags?.Primary"
            :src="getEpisodeImage(episode.id, episode.imageTags.Primary)"
            :alt="episode.name"
            class="episode-image"
            loading="lazy"
          />
          <div v-else class="episode-no-image">
            <span>E{{ episode.indexNumber }}</span>
          </div>
          
          <div 
            v-if="episode.userData?.playbackPositionTicks && episode.runTimeTicks"
            class="episode-progress"
          >
            <div 
              class="episode-progress-fill"
              :style="{ width: getProgressPercent(episode) + '%' }"
            />
          </div>
          
          <div v-if="episode.userData?.played" class="watched-badge">✓</div>
        </div>
        
        <div class="episode-info">
          <span class="episode-number">E{{ episode.indexNumber }}</span>
          <span class="episode-name">{{ episode.name }}</span>
          <span v-if="episode.overview" class="episode-overview">
            {{ truncateOverview(episode.overview) }}
          </span>
          <span v-if="episode.runTimeTicks" class="episode-runtime">
            {{ formatRuntime(episode.runTimeTicks) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { jellyfinApi } from '@/services/jellyfin-api';
import type { SeasonDto, EpisodeDto } from '@/types/item';

interface Props {
  seasons: SeasonDto[];
  episodes: EpisodeDto[];
  selectedIndex: number;
}

defineProps<Props>();
defineEmits(['selectSeason', 'playEpisode']);

function getEpisodeImage(episodeId: string, tag: string): string {
  return jellyfinApi.getImageUrl(episodeId, 'Primary', {
    width: 300,
    tag,
  });
}

function getProgressPercent(episode: EpisodeDto): number {
  if (!episode.userData?.playbackPositionTicks || !episode.runTimeTicks) return 0;
  return Math.round((episode.userData.playbackPositionTicks / episode.runTimeTicks) * 100);
}

function truncateOverview(text: string): string {
  if (text.length <= 120) return text;
  return text.slice(0, 120) + '...';
}

function formatRuntime(ticks: number): string {
  const minutes = Math.round(ticks / 10_000_000 / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}
</script>

<style scoped>
.seasons-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sao-text);
  margin: 0 0 16px 0;
  padding: 0 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.season-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
}

.season-tabs::-webkit-scrollbar {
  display: none;
}

.season-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--sao-dim);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.season-tab:hover {
  border-color: var(--sao-cyan);
  color: var(--sao-cyan);
}

.season-tab.active {
  background: var(--sao-cyan);
  color: var(--sao-bg);
  border-color: var(--sao-cyan);
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.episode-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.episode-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--sao-cyan);
}

.episode-card.watched {
  opacity: 0.6;
}

.episode-thumb {
  position: relative;
  width: 160px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--sao-surface);
}

.episode-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.episode-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sao-dim);
  font-size: 1.2rem;
  font-weight: 600;
}

.episode-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
}

.episode-progress-fill {
  height: 100%;
  background: var(--sao-cyan);
  transition: width 0.3s;
}

.watched-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: var(--sao-cyan);
  color: var(--sao-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.episode-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  min-width: 0;
}

.episode-number {
  color: var(--sao-cyan);
  font-size: 0.8rem;
  font-weight: 600;
}

.episode-name {
  color: var(--sao-text);
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.episode-overview {
  color: var(--sao-dim);
  font-size: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.episode-runtime {
  color: var(--sao-dim);
  font-size: 0.75rem;
  opacity: 0.7;
}

@media (max-width: 600px) {
  .episode-thumb {
    width: 120px;
    height: 68px;
  }
}
</style>