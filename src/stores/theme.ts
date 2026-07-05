// src/stores/theme.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeName = 'default' | 'medieval' | 'halloween' | 'christmas';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>(
    (localStorage.getItem('ryoky_theme') as ThemeName) || 'default'
  );

  function setTheme(theme: ThemeName) {
    // 1. Mise à jour de l'attribut HTML (déclenche le changement CSS instantané)
    document.documentElement.setAttribute('data-theme', theme);
    
    // 2. Mise à jour du state et du localStorage
    currentTheme.value = theme;
    localStorage.setItem('ryoky_theme', theme);
  }

  return { currentTheme, setTheme };
});