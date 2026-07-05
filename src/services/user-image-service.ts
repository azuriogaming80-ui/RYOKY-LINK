const JELLYFIN_URL = import.meta.env.VITE_JELLYFIN_URL || 'http://localhost:49169';

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
    return `${JELLYFIN_URL}/Users/${user.id}/Images/Primary?tag=${user.primaryImageTag}&maxHeight=300&maxWidth=300&quality=90`;
  }
  return '';
}