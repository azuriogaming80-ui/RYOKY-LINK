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
                v-if="getProfileImageUrl(user)"
                :src="getProfileImageUrl(user)"
                :alt="user.Name"
                loading="lazy"
                @error="handleAvatarError(user)"
              />
              <div v-else class="avatar-fallback">
                {{ user.Name?.charAt(0) || '?' }}
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
              v-if="getProfileImageUrl(selectedUser) && !avatarErrors[selectedUser?.Id]"
              :src="getProfileImageUrl(selectedUser)"
              :alt="selectedUser?.Name"
              @error="handleAvatarError(selectedUser)"
            />
            <div v-else class="avatar-fallback large">
              {{ selectedUser?.Name?.charAt(0) || '?' }}
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
    
    //  Configurer le serveur AVANT tout appel API
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
    error.value = err.response?.data?.Message || 'Échec d\'authentification - vérifiez le mot de passe';
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

// 🔒 URL de l'image de profil avec injection du token pour contourner l'auth Jellyfin
const getProfileImageUrl = (user: any): string => {
  if (!user?.Id) return '';
  // L'API /Users/Public renvoie HasPassword mais pas toujours PrimaryImageTag
  // On construit l'URL et on laisse le @error gérer le fallback si pas d'image
  const url = `${jellyfinApi.baseUrl}/Users/${user.Id}/Images/Primary`;
  const params = new URLSearchParams();
  
  // Injection du token si disponible (pour les images qui nécessitent une auth)
  if (jellyfinApi.token) {
    params.append('api_key', jellyfinApi.token);
  }
  
  // Taille optimisée pour les avatars
  params.append('MaxWidth', '200');
  params.append('Quality', '90');
  
  return `${url}?${params.toString()}`;
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sao-background);
  padding: 2rem;
}

.login-hud {
  width: 100%;
  max-width: 600px;
  background: var(--sao-surface);
  border: 2px solid var(--sao-cyan);
  border-radius: var(--radius-lg);
  padding: 3rem;
  box-shadow: 0 0 30px var(--sao-cyan-glow), inset 0 0 60px rgba(0, 255, 255, 0.05);
  position: relative;
}

/* Coins décoratifs SAO */
.login-hud::before,
.login-hud::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid var(--sao-cyan);
  border-radius: 50%;
  background: var(--sao-cyan);
  box-shadow: 0 0 10px var(--sao-cyan-glow);
}

.login-hud::before {
  top: -6px;
  left: -6px;
}

.login-hud::after {
  bottom: -6px;
  right: -6px;
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sao-cyan);
  text-shadow: 0 0 20px var(--sao-cyan-glow);
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.1em;
}

.login-subtitle {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--sao-accent);
  margin: 0;
  letter-spacing: 0.05em;
}

.login-step {
  animation: fadeIn 0.4s ease;
}

.login-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--sao-text-secondary);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.login-input {
  width: 100%;
  padding: 1rem;
  background: var(--sao-background);
  border: 1px solid var(--sao-border);
  border-radius: var(--radius-md);
  color: var(--sao-text);
  font-family: var(--font-body);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: var(--sao-cyan);
  box-shadow: 0 0 15px var(--sao-cyan-glow);
}

.login-button {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 2px solid var(--sao-cyan);
  border-radius: var(--radius-md);
  color: var(--sao-cyan);
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.login-button:hover {
  background: var(--sao-cyan);
  color: var(--sao-background);
  box-shadow: 0 0 20px var(--sao-cyan-glow);
  transform: translateY(-2px);
}

.login-button.secondary {
  border-color: var(--sao-border);
  color: var(--sao-text-secondary);
  margin-top: 1rem;
}

.login-button.secondary:hover {
  background: var(--sao-surface-elevated);
  color: var(--sao-text);
  box-shadow: none;
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-error {
  color: #ff4444;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
  animation: shake 0.5s ease;
}

.login-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--sao-border);
  border-top-color: var(--sao-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Grille des profils */
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-card {
  background: var(--sao-background);
  border: 2px solid var(--sao-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.profile-card:hover {
  border-color: var(--sao-cyan);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--sao-cyan-glow);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--sao-border);
  transition: all 0.3s ease;
  background: var(--sao-surface-elevated);
}

.profile-avatar.large {
  width: 120px;
  height: 120px;
}

.profile-card:hover .profile-avatar {
  border-color: var(--sao-cyan);
  box-shadow: 0 0 20px var(--sao-cyan-glow);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sao-cyan), var(--sao-cyan-dark));
  color: var(--sao-background);
  font-size: 2rem;
  font-weight: bold;
}

.avatar-fallback.large {
  font-size: 3rem;
}

.profile-name {
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--sao-text);
  text-align: center;
  word-break: break-word;
}

.selected-profile {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--sao-cyan);
  margin: 1rem 0 0 0;
}

/* Animations */
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .login-hud {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .profiles-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .profile-avatar {
    width: 70px;
    height: 70px;
  }
}
</style>