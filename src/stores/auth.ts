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
    jellyfinApi.setServer(server)
    const result = await jellyfinApi.authenticateByName(username, password)

    accessToken.value = result.AccessToken
    userId.value = result.User.Id
    serverUrl.value = server
    currentUser.value = result.User

    localStorage.setItem('jellyfin_server', server)
    localStorage.setItem('jellyfin_token', result.AccessToken)
    localStorage.setItem('jellyfin_userid', result.User.Id)

    jellyfinApi.setToken(result.AccessToken)
    jellyfinApi.setUserId(result.User.Id)

    return result
  }

  function logout() {
    accessToken.value = ''
    userId.value = ''
    currentUser.value = null
    localStorage.removeItem('jellyfin_token')
    localStorage.removeItem('jellyfin_userid')
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