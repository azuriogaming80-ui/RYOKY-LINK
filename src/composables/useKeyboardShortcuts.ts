import { onMounted, onBeforeUnmount } from 'vue';

interface PlayerControls {
  togglePlay: () => void;
  seek: (offsetSeconds: number) => void;
  toggleFullscreen?: () => void; // Optionnel
}

export function useKeyboardShortcuts(controls: PlayerControls) {
  const handleKeydown = (event: KeyboardEvent) => {
    // On ignore les raccourcis si l'utilisateur tape dans un champ de texte (ex: barre de recherche)
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault(); // Empêche le scroll de la page
        controls.togglePlay();
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        controls.seek(-10); // Recule de 10s
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        controls.seek(10);  // Avance de 10s
        break;

      case 'KeyF':
        event.preventDefault();
        if (controls.toggleFullscreen) controls.toggleFullscreen();
        break;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
}