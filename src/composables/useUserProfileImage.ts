// src/composables/useUserProfileImage.ts
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getUserProfileImageUrl } from '@/services/user-image-service';

export function useUserProfileImage() {
  const auth = useAuthStore();

  /**
   * Récupère l'URL de l'image de profil pour un utilisateur
   * @param userId - ID de l'utilisateur Jellyfin
   * @param options - Options de redimensionnement (width, height, quality)
   * @returns URL complète avec authentification
   */
  function getUserProfileImage(userId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): string {
    return getUserProfileImageUrl(
      auth.serverUrl,
      userId,
      auth.accessToken,
      options
    );
  }

  /**
   * Image de profil de l'utilisateur courant
   */
  const currentUserProfileImage = computed(() => {
    if (!auth.userId) return '';
    return getUserProfileImage(auth.userId, { width: 256, height: 256 });
  });

  return {
    getUserProfileImage,
    currentUserProfileImage,
  };
}
