<template>
  <div class="theme-switcher">
    <select @change="changeTheme($event)" :value="themeStore.currentTheme" class="theme-select">
      <option value="default">🌟 Link Start (Défaut)</option>
      <option value="medieval">🏰 Médiéval</option>
      <option value="halloween">🎃 Halloween</option>
      <option value="christmas">🎄 Noël</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import type { ThemeName } from '@/stores/theme';

const themeStore = useThemeStore();

const changeTheme = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  themeStore.setTheme(target.value as ThemeName);
};
</script>

<style scoped>
.theme-select {
  background: var(--sao-surface);
  color: var(--sao-text);
  border: 1px solid var(--sao-dim);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.theme-select:hover, .theme-select:focus {
  border-color: var(--sao-cyan);
  box-shadow: 0 0 8px var(--sao-cyan-glow);
}
</style>