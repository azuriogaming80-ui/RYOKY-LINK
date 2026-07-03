<template>
  <div class="login-view">
    <!-- Fragments de données flottants en arrière-plan -->
    <div class="data-fragments">
      <span v-for="n in 20" :key="n" class="fragment" :style="fragmentStyle(n)">
        {{ randomHex() }}
      </span>
    </div>

    <!-- Cadre auth avec circuit dashed -->
    <div class="auth-track">
      <!-- 4 voyants aux coins -->
      <div class="corner-light tl"></div>
      <div class="corner-light tr"></div>
      <div class="corner-light bl"></div>
      <div class="corner-light br"></div>

      <!-- Scanline laser cyan -->
      <div class="scanline-laser"></div>

      <!-- Contenu -->
      <div class="auth-content">
        <h1 class="auth-title">RYOKY-LINK</h1>
        <p class="auth-subtitle">Système de Sécurité Active</p>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="input-group">
            <label>Serveur</label>
            <input
              v-model="server"
              type="url"
              placeholder="http://192.168.1.10:8096"
              required
            />
          </div>

          <div class="input-group">
            <label>Identifiant</label>
            <input
              v-model="username"
              type="text"
              placeholder="Nom d'utilisateur"
              required
            />
          </div>

          <div class="input-group">
            <label>Mot de passe</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="auth-btn" :disabled="isLoading">
            <span v-if="isLoading">CONNEXION...</span>
            <span v-else>AUTHENTIFIER</span>
          </button>

          <p v-if="error" class="auth-error">{{ error }}</p>
        </form>
      </div>
    </div>

    <div class="version-tag">v1.0.0 // RYOKY_OS COMPATIBLE</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const server = ref('')
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

function randomHex(): string {
  return Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0')
}

function fragmentStyle(n: number): Record<string, string> {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`,
    opacity: `${0.1 + Math.random() * 0.2}`,
    fontSize: `${0.6 + Math.random() * 0.4}rem`
  }
}

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  try {
    await auth.login(server.value, username.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Échec d\'authentification — vérifie le serveur et les identifiants.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (auth.serverUrl) server.value = auth.serverUrl
})
</script>

<style scoped>
.login-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sao-bg);
  position: relative;
  overflow: hidden;
}

/* Fragments de données flottants */
.data-fragments {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.fragment {
  position: absolute;
  font-family: var(--font-mono);
  color: var(--sao-cyan);
  user-select: none;
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  20% {
    opacity: var(--frag-opacity, 0.2);
  }
  80% {
    opacity: var(--frag-opacity, 0.2);
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}

/* Circuit auth-track */
.auth-track {
  position: relative;
  width: 420px;
  max-width: 90vw;
  padding: 3rem 2.5rem;
  border: 1px dashed var(--sao-dim);
  background: rgba(18, 18, 26, 0.9);
  z-index: 1;
}

/* Voyants aux coins */
.corner-light {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--sao-dim);
  border-radius: 50%;
  transition: background 0.3s, box-shadow 0.3s;
}

.corner-light.tl { top: -4px; left: -4px; }
.corner-light.tr { top: -4px; right: -4px; }
.corner-light.bl { bottom: -4px; left: -4px; }
.corner-light.br { bottom: -4px; right: -4px; }

/* Séquence d'allumage des voyants */
.auth-track:hover .corner-light,
.auth-track:focus-within .corner-light {
  background: var(--sao-cyan);
  box-shadow: 0 0 8px var(--sao-cyan-glow);
}

.auth-track .corner-light.tl { animation: blink 0.5s ease forwards; }
.auth-track .corner-light.tr { animation: blink 0.5s ease 0.1s forwards; }
.auth-track .corner-light.br { animation: blink 0.5s ease 0.2s forwards; }
.auth-track .corner-light.bl { animation: blink 0.5s ease 0.3s forwards; }

@keyframes blink {
  0% { background: var(--sao-dim); box-shadow: none; }
  50% { background: var(--sao-cyan); box-shadow: 0 0 12px var(--sao-cyan-glow); }
  100% { background: var(--sao-cyan); box-shadow: 0 0 6px var(--sao-cyan-glow); }
}

/* Scanline laser cyan */
.scanline-laser {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--sao-cyan), transparent);
  box-shadow: 0 0 10px var(--sao-cyan-glow);
  animation: scanSweep 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes scanSweep {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Contenu */
.auth-content {
  position: relative;
  z-index: 2;
}

.auth-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--sao-cyan);
  text-align: center;
  letter-spacing: 4px;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px var(--sao-cyan-glow);
  animation: neonPulse 2.5s ease-in-out infinite alternate;
}

@keyframes neonPulse {
  from { text-shadow: 0 0 10px var(--sao-cyan-glow), 0 0 20px var(--sao-cyan-glow); }
  to { text-shadow: 0 0 20px var(--sao-cyan-glow), 0 0 40px var(--sao-cyan-glow), 0 0 60px rgba(0, 240, 255, 0.2); }
}

.auth-subtitle {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--sao-amber);
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 2.5rem;
  opacity: 0;
  animation: fadeIn 1s ease 0.5s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Formulaire */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.input-group label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--sao-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-group input {
  background: var(--sao-surface);
  border: 1px solid var(--sao-dim);
  border-radius: var(--radius-sm);
  padding: 0.8rem 1rem;
  color: var(--sao-text);
  font-family: var(--font-display);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-group input:focus {
  border-color: var(--sao-cyan);
  box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.15);
}

.input-group input::placeholder {
  color: var(--sao-dim);
}

.auth-btn {
  margin-top: 0.5rem;
  padding: 0.9rem;
  background: transparent;
  border: 1px solid var(--sao-cyan);
  color: var(--sao-cyan);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.auth-btn:hover:not(:disabled) {
  background: var(--sao-cyan);
  color: var(--sao-bg);
  box-shadow: 0 0 20px var(--sao-cyan-glow);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--sao-dim);
  color: var(--sao-dim);
}

.auth-error {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--sao-danger);
  text-align: center;
  margin-top: 0.5rem;
}

.version-tag {
  position: absolute;
  bottom: 1.5rem;
  right: 2rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--sao-dim);
  letter-spacing: 1px;
  z-index: 1;
}
</style>