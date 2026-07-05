import axios from 'axios';

// On utilise un préfixe relatif pour passer par le proxy Vite (et le futur reverse proxy Nginx/Caddy en prod)
const API_PREFIX = '/api';

export const jellyfinApi = axios.create({
  baseURL: API_PREFIX,
  headers: {
    'X-Emby-Authorization': 'MediaBrowser Client="RYOKY-LINK", Device="Web", DeviceId="ryoky-web-01", Version="1.0.0"'
  }
});

// Mapper camelCase récursif
function toCamel(o: any): any {
  let newO: any, k: string;
  if (Array.isArray(o)) {
    newO = [];
    for (let i = 0; i < o.length; i++) newO.push(toCamel(o[i]));
  } else if (o !== null && typeof o === 'object') {
    newO = {};
    for (k in o) {
      if (o.hasOwnProperty(k)) {
        const camelKey = k.replace(/^[A-Z]/, (m) => m.toLowerCase()).replace(/[A-Z]/g, (m) => '_' + m.toLowerCase()).replace(/_./g, (m) => m[1].toUpperCase());
        newO[camelKey] = toCamel(o[k]);
      }
    }
  } else {
    return o;
  }
  return newO;
}

// Intercepteur global pour TOUTES les réponses
jellyfinApi.interceptors.response.use(
  (response) => {
    if (response.data) response.data = toCamel(response.data);
    return response;
  },
  (error) => Promise.reject(error)
);

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getImageUrl(itemId: string, tag: string, type: string = 'Primary'): string {
  if (!itemId || !tag) return '';
  // L'URL de l'image passe aussi par le proxy /api pour éviter les soucis de mixed-content ou CORS
  return `${API_PREFIX}/Items/${itemId}/Images/${type}?tag=${tag}&maxHeight=400&quality=90`;
}