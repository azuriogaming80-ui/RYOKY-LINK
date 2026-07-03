<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function handleUnauthorized() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  auth.restoreSession()
  window.addEventListener('jellyfin:unauthorized', handleUnauthorized)
})

onUnmounted(() => {
  window.removeEventListener('jellyfin:unauthorized', handleUnauthorized)
})
</script>