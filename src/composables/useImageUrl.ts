// src/composables/useImageUrl.ts
import { jellyfinApi } from '@/services/jellyfin-api';
import { useAuthStore } from '@/stores/auth';
import { getUserProfileImageUrl as getProfileImageUrl } from '@/services/user-image-service';

export function useImageUrl() {
  const auth = useAuthStore();

  function getPrimaryImageUrl(
    itemId: string,
    options?: { width?: number; height?: number; tag?: string }
  ): string {
    return jellyfinApi.getImageUrl(itemId, 'Primary', options);
  }

  function getBackdropUrl(
    itemId: string,
    options?: { width?: number; height?: number; tag?: string }
  ): string {
    return jellyfinApi.getImageUrl(itemId, 'Backdrop', options);
  }

  function getLogoUrl(itemId: string, tag?: string): string {
    return jellyfinApi.getImageUrl(itemId, 'Logo', { width: 400, tag });
  }

  function getThumbUrl(itemId: string, tag?: string): string {
    return jellyfinApi.getImageUrl(itemId, 'Thumb', { width: 600, tag });
  }

  // ========== USER PROFILE IMAGES ==========
  function getUserProfileImage(
    userId: string,
    options?: { width?: number; height?: number; quality?: number }
  ): string {
    return getProfileImageUrl(
      auth.serverUrl,
      userId,
      auth.accessToken,
      options
    );
  }

  return {
    getPrimaryImageUrl,
    getBackdropUrl,
    getLogoUrl,
    getThumbUrl,
    getUserProfileImage,
  };
}
