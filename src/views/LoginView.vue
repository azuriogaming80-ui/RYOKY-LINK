<template>
  <div class="login-container">
    <div class="login-hud">
      <!-- En-tête SAO -->
      <div class="login-header">
        <h1 class="login-title">RYOKY-LINK</h1>
        <p class="login-subtitle">Système de Sécurité Active</p>
      </div>

      <!-- Étape 1: Sélection du serveur -->
      <div v-if="step === 'server'" class="login-step">
        <label class="login-label">SERVEUR</label>
        <input
          v-model="serverUrl"
          type="text"
          placeholder="http://www.kaokyserver.ovh:49169"
          class="login-input"
          @keyup.enter="connectToServer"
        />
        <button class="login-button" @click="connectToServer">
          CONNECTER AU SERVEUR
        </button>
        <p v-if="error" class="login-error">{{ error }}</p>
      </div>

      <!-- Étape 2: Grille des profils -->
      <div v-else-if="step === 'profiles'" class="login-step">
        <label class="login-label">SÉLECTIONNER UN PROFIL</label>
        <div class="profiles-grid">
          <button
            v-for="user in users"
            :key="user.Id"
            class="profile-card"
            @click="selectUser(user)"
          >
            <div class="profile-avatar">
              <img
                v-if="!avatarErrors[user.Id]"
                :src="getProfileImageUrl(user)"
                :alt="user.Name"
                loading="lazy"
                @error="handleAvatarError(user)"
              />
              <div v-else class="avatar-fallback">
                {{ getInitials(user.Name) }}
              </div>
            </div>
            <span class="profile-name">{{ user.Name }}</span>
          </button>
        </div>
        <button class="login-button secondary" @click="resetToServer">
          CHANGER DE SERVEUR
        </button>
      </div>

      <!-- Étape 3: Mot de passe -->
      <div v-else-if="step === 'password'" class="login-step">
        <div class="selected-profile">
          <div class="profile-avatar large">
            <img
              v-if="!avatarErrors[selectedUser?.Id]"
              :src="getProfileImageUrl(selectedUser)"
              :alt="selectedUser?.Name"
              @error="handleAvatarError(selectedUser)"
            />
            <div v-else class="avatar-fallback large">
              {{ getInitials(selectedUser?.Name) }}
            </div>
          </div>
          <h2 class="profile-title">{{ selectedUser?.Name }}</h2>
        </div>
        <label class="login-label">MOT DE PASSE</label>
        <input
          v-model="password"
          type="password"
          placeholder="Laisser vide si aucun mot de passe"
          class="login-input"
          @keyup.enter="authenticate"
        />
        <div class="login-actions">
          <button class="login-button" @click="authenticate">
            AUTHENTIFIER
          </button>
          <button class="login-button secondary" @click="resetToProfiles">
            RETOUR
          </button>
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="login-loading">
        <div class="loading-spinner"></div>
        <p>Connexion en cours...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { jellyfinApi } from '@/services/jellyfin-api';
import { useAuthStore } from '@/stores/auth';
import { getUserProfileImageUrl } from '@/services/user-image-service';

const router = useRouter();
const authStore = useAuthStore();

// États
const step = ref<'server' | 'profiles' | 'password'>('server');
const serverUrl = ref('http://www.kaokyserver.ovh:49169');
const isLoading = ref(false);
const error = ref('');
const users = ref<any[]>([]);
const selectedUser = ref<any>(null);
const password = ref('');
const avatarErrors = reactive<Record<string, boolean>>({});

// Fonction pour récupérer les initiales (façon TuiUserSelect)
const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Connexion au serveur Jellyfin
const connectToServer = async () => {
  if (!serverUrl.value.trim()) {
    error.value = 'Veuillez entrer une URL de serveur';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Normaliser l'URL (supprimer le slash final)
    const url = serverUrl.value.replace(/\/$/, '');

    // Configurer le serveur AVANT tout appel API
    jellyfinApi.setServer(url);

    // Récupérer la liste des utilisateurs publics
    const data = await jellyfinApi.getPublicUsers();
    users.value = data || [];

    if (users.value.length === 0) {
      error.value = 'Aucun profil trouvé sur ce serveur';
      return;
    }

    // Passer à l'étape des profils
    step.value = 'profiles';
  } catch (err: any) {
    console.error('Connection error:', err);
    error.value = err.message || 'Impossible de se connecter au serveur';
  } finally {
    isLoading.value = false;
  }
};

// Sélection d'un utilisateur
const selectUser = (user: any) => {
  selectedUser.value = user;
  password.value = '';
  step.value = 'password';
};

// Authentification
const authenticate = async () => {
  if (!selectedUser.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const authData = await jellyfinApi.authenticateByName(
      selectedUser.value.Name,
      password.value
    );

    // Sauvegarder dans le store d'authentification
    await authStore.login({
      serverUrl: serverUrl.value.replace(/\/$/, ''),
      token: authData.AccessToken,
      userId: authData.User.Id,
      username: selectedUser.value.Name,
    });

    // Redirection vers le dashboard
    router.push('/');
  } catch (err: any) {
    console.error('Authentication error:', err);
    error.value = err.response?.data?.Message || "Échec d'authentification - vérifiez le mot de passe";
  } finally {
    isLoading.value = false;
  }
};

// Retour à l'étape précédente
const resetToProfiles = () => {
  selectedUser.value = null;
  password.value = '';
  error.value = '';
  step.value = 'profiles';
};

const resetToServer = () => {
  users.value = [];
  selectedUser.value = null;
  password.value = '';
  error.value = '';
  step.value = 'server';
};

// Gestion des erreurs d'avatar (par utilisateur pour éviter de tout cacher)
const handleAvatarError = (user: any) => {
  if (user?.Id) {
    avatarErrors[user.Id] = true;
  }
};

// 🔒 URL de l'image de profil - Utilise le bon endpoint Jellyfin
const getProfileImageUrl = (user: any): string => {
  if (!user?.Id) return '';
  // ✅ Utilise le service dédié aux images de profil
  return getUserProfileImageUrl(
    serverUrl.value.replace(/\/$/, ''),
    user.Id,
    jellyfinApi.token || '',
    { height: 300, width: 300 }
  );
};
</script>

<style scoped>
/* Container principal */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sao-bg);
  padding: 20px;
}

.login-hud {
  width: 100%;
  max-width: 900px;
  border: 1px solid var(--sao-cyan);
  background: rgba(10, 10, 15, 0.8);
  padding: 40px;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.15);
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--sao-cyan);
  letter-spacing: 8px;
  margin: 0;
  text-shadow: 0 0 20px var(--sao-cyan-glow);
  animation: neonPulse 3s ease-in-out infinite;
}

.login-subtitle {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--sao-text-secondary);
  letter-spacing: 3px;
  margin-top: 8px;
}

@keyframes neonPulse {
  0%, 100% {
    text-shadow: 0 0 10px var(--sao-cyan), 0 0 20px var(--sao-cyan);
  }
  50% {
    text-shadow: 0 0 20px var(--sao-cyan), 0 0 40px var(--sao-cyan), 0 0 60px var(--sao-cyan-glow);
  }
}

/* Steps */
.login-step {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--sao-dim);
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.login-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--sao-dim);
  color: var(--sao-cyan);
  font-family: var(--font-mono);
  font-size: 1rem;
  padding: 14px 18px;
  outline: none;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.login-input:focus {
  border-color: var(--sao-cyan);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
}

.login-input::placeholder {
  color: var(--sao-text-secondary);
}

/* Buttons */
.login-button {
  width: 100%;
  background: transparent;
  border: 1px solid var(--sao-cyan);
  color: var(--sao-cyan);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 14px 24px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.3);
  transform: translateY(-2px);
}

.login-button.secondary {
  border-color: var(--sao-dim);
  color: var(--sao-text-secondary);
  margin-top: 20px;
}

.login-button.secondary:hover {
  border-color: var(--sao-amber);
  color: var(--sao-amber);
  background: rgba(255, 184, 0, 0.1);
  box-shadow: 0 0 20px rgba(255, 184, 0, 0.2);
}

/* Error */
.login-error {
  color: var(--sao-danger);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  margin-top: 16px;
  text-align: center;
  text-shadow: 0 0 8px rgba(255, 68, 68, 0.3);
}

/* Profiles Grid */
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.profile-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--sao-dim);
  padding: 20px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-card:hover {
  border-color: var(--sao-cyan);
  background: rgba(0, 240, 255, 0.05);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.2);
  transform: translateY(-4px);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border: 2px solid var(--sao-dim);
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.profile-card:hover .profile-avatar {
  border-color: var(--sao-cyan);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sao-cyan);
  text-shadow: 0 0 10px var(--sao-cyan-glow);
}

.profile-avatar.large {
  width: 120px;
  height: 120px;
}

.avatar-fallback.large {
  font-size: 3rem;
}

.profile-name {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--sao-text);
  letter-spacing: 1px;
  text-align: center;
}

/* Selected Profile */
.selected-profile {
  text-align: center;
  margin-bottom: 30px;
}

.profile-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--sao-cyan);
  margin-top: 16px;
  letter-spacing: 3px;
}

/* Login Actions */
.login-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.login-actions .login-button {
  flex: 1;
}

/* Loading */
.login-loading {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--sao-dim);
  border-top-color: var(--sao-cyan);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-hud {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 2rem;
    letter-spacing: 4px;
  }

  .login-subtitle {
    font-size: 0.8rem;
  }

  .profiles-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 16px;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
  }

  .avatar-fallback {
    font-size: 2rem;
  }

  .profile-avatar.large {
    width: 100px;
    height: 100px;
  }

  .avatar-fallback.large {
    font-size: 2.5rem;
  }

  .login-actions {
    flex-direction: column;
  }
}
</style>
