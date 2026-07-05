// src/composables/useFocusNav.ts
import { onMounted, onUnmounted } from 'vue';

export function useFocusNav() {
  const handleKeyDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    // On ne réagit que si l'élément focusé est une carte média
    if (!activeEl || !activeEl.classList.contains('media-card')) return;

    const currentRail = activeEl.closest('.media-rail');
    if (!currentRail) return;

    const cards = Array.from(currentRail.querySelectorAll('.media-card')) as HTMLElement[];
    const currentIndex = cards.indexOf(activeEl as HTMLElement);

    // ➡️ Navigation Droite
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < cards.length - 1) {
        cards[currentIndex + 1].focus();
        cards[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } 
    // ⬅️ Navigation Gauche
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        cards[currentIndex - 1].focus();
        cards[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } 
    // ⬇️ Navigation Bas (Rail suivant)
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRail = currentRail.nextElementSibling?.querySelector('.media-card') as HTMLElement;
      if (nextRail) {
        nextRail.focus();
        nextRail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } 
    // ⬆️ Navigation Haut (Rail précédent)
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRail = currentRail.previousElementSibling?.querySelector('.media-card') as HTMLElement;
      if (prevRail) {
        prevRail.focus();
        prevRail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
}