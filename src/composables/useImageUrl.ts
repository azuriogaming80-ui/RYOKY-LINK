// src/composables/useImageUrl.ts
import { jellyfinApi } from '@/services/jellyfin-api';

export function useImageUrl() {
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

  return {
    getPrimaryImageUrl,
    getBackdropUrl,
    getLogoUrl,
    getThumbUrl,
  };
}