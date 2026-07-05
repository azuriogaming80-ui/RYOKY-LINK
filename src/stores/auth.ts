// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jellyfinApi } from '@/services/jellyfin-api'
import type { AuthenticationResult } from '@/types/jellyfin'

export const useAuthStore = defineStore('auth', () => {
  const serverUrl = ref(localStorage.getItem('jellyfin_server') || '')
  const accessToken = ref(localStorage.getItem('jellyfin_token') || '')
  const userId = ref(localStorage.getItem('jellyfin_userid') || '')
  const currentUser = ref<any>(null)
  
  const isAuthenticated = computed(() => !!accessToken.value && !!serverUrl.value)

  async function login(server: string, username: string, password: string): Promise<AuthenticationResult> {
    // Nettoyage et injection de l'URL serveur
    const cleanServer = server.replace(/\/+$/, '')
    jellyfinApi.setServer(cleanServer)
    
    const result = await jellyfinApi.authenticateByName(username, password)
    
    // Mise à jour de l'état réactif
    accessToken.value = result.AccessToken
    userId.value = result.User.Id
    serverUrl.value = cleanServer
    currentUser.value = result.User
    
    // Persistance locale
    localStorage.setItem('jellyfin_server', cleanServer)
    localStorage.setItem('jellyfin_token', result.AccessToken)
    localStorage.setItem('jellyfin_userid', result.User.Id)
    
    // Synchronisation avec l'instance API
    jellyfinApi.setToken(result.AccessToken)
    jellyfinApi.setUserId(result.User.Id)
    
    return result
  }

  function logout() {
    // Nettoyage de l'état et du stockage
    accessToken.value = ''
    userId.value = ''
    currentUser.value = null
    localStorage.removeItem('jellyfin_token')
    localStorage.removeItem('jellyfin_userid')
    
    // Reset de l'instance API
    jellyfinApi.setToken('')
    jellyfinApi.setUserId('')
    
    // Dispatch global pour que le router puisse réagir
    window.dispatchEvent(new CustomEvent('jellyfin:logout'))
  }

  function restoreSession() {
    if (accessToken.value && serverUrl.value) {
      jellyfinApi.setServer(serverUrl.value)
      jellyfinApi.setToken(accessToken.value)
      jellyfinApi.setUserId(userId.value)
    }
  }

  return {
    serverUrl,
    accessToken,
    userId,
    currentUser,
    isAuthenticated,
    login,
    logout,
    restoreSession
  }
})