import { defineStore } from 'pinia';
import { jellyfinApi } from '../services/jellyfin-api';

interface User {
  id: string;
  name: string;
  serverId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  serverUrl: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('jellyfin_token'),
    user: JSON.parse(localStorage.getItem('jellyfin_user') || 'null'),
    serverUrl: localStorage.getItem('server_url') || import.meta.env.VITE_JELLYFIN_URL
  }),
  
  actions: {
    async authenticateByName(username: string, password: string) {
      try {
        const response = await jellyfinApi.post('/Users/AuthenticateByName', {
          Username: username,
          Pw: password
        });
        
        const data = response.data; // Déjà en camelCase grâce à l'intercepteur !
        
        this.token = data.accessToken;
        this.user = {
          id: data.user.id,
          name: data.user.name,
          serverId: data.user.serverId
        };
        
        localStorage.setItem('jellyfin_token', this.token);
        localStorage.setItem('jellyfin_user', JSON.stringify(this.user));
        
        jellyfinApi.defaults.headers.common['X-Emby-Authorization'] = 
          `MediaBrowser Client="RYOKY-LINK", Device="Web", DeviceId="ryoky-web-01", Version="1.0.0", Token="${this.token}"`;
          
        return data;
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        throw error;
      }
    },

    async getPublicUsers() {
      const response = await jellyfinApi.get('/Users/Public');
      return response.data; 
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('jellyfin_token');
      localStorage.removeItem('jellyfin_user');
      delete jellyfinApi.defaults.headers.common['X-Emby-Authorization'];
    },

    restoreSession() {
      if (this.token && this.user) {
        jellyfinApi.defaults.headers.common['X-Emby-Authorization'] = 
          `MediaBrowser Client="RYOKY-LINK", Device="Web", DeviceId="ryoky-web-01", Version="1.0.0", Token="${this.token}"`;
      }
    }
  }
});