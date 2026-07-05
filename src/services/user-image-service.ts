const API_PREFIX = '/api';

export interface PublicUser {
  id: string;
  name: string;
  serverId: string;
  hasPassword: boolean;
  primaryImageTag?: string;
}

export function getProfileImageUrl(user: PublicUser): string {
  if (!user || !user.id) return '';
  if (user.primaryImageTag) {
    // On utilise le préfixe /api pour que le navigateur passe par le proxy Vite !
    return `${API_PREFIX}/Users/${user.id}/Images/Primary?tag=${user.primaryImageTag}&maxHeight=300&maxWidth=300&quality=90`;
  }
  return '';
}