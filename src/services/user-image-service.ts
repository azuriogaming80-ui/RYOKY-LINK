// src/services/user-image-service.ts
/**
 * Service spécialisé pour la récupération des images de profil utilisateur
 * Les images de profil utilisateur utilisent un endpoint différent que les autres images
 */

export function getUserProfileImageUrl(baseUrl: string, userId: string, token: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): string {
  if (!userId || !baseUrl || !token) {
    return '';
  }

  let url = `${baseUrl}/Users/${userId}/ProfileImage`;
  const params = new URLSearchParams();

  // Token d'authentification obligatoire pour les images de profil
  params.append('api_key', token);

  // Options optionnelles de redimensionnement
  if (options?.width) params.append('MaxWidth', String(options.width));
  if (options?.height) params.append('MaxHeight', String(options.height));
  if (options?.quality) params.append('Quality', String(options.quality));

  if (params.toString()) url += `?${params.toString()}`;
  return url;
}
