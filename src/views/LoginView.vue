<template>
  <div class="login-container">
    <!-- Sélecteur de Thème -->
    <div class="theme-selector-wrapper">
      <select v-model="themeStore.currentTheme" class="theme-selector" @change="themeStore.setTheme(themeStore.currentTheme)">
        <option value="sao">⚔️ SAO</option>
        <option value="medieval">🏰 Médiéval</option>
        <option value="halloween">🎃 Halloween</option>
        <option value="christmas">🎄 Noël</option>
      </select>
    </div>

    <div class="login-content" v-if="!selectedUser">
      <h1 class="login-title">Choisis ton profil</h1>
      <div class="profiles-grid">
        <div 
          v-for="user in publicUsers" 
          :key="user.id" 
          class="profile-card"
          @click="selectProfile(user)"
          tabindex="0"
          @keyup.enter="selectProfile(user)"
        >
          <div class="profile-avatar">
            <img 
              v-if="getProfileImg(user)" 
              :src="getProfileImg(user)" 
              :alt="user.name" 
              @error="handleImageError"
              loading="lazy"
            />
            <div v-else class="profile-initials">
              {{ user.name ? user.name.charAt(0).toUpperCase() : '?' }}
            </div>
          </div>
          <span class="profile-name">{{ user.name }}</span>
        </div>
      </div>
    </div>

    <div class="login-content" v-else>
      <h1 class="login-title">Bonjour {{ selectedUser.name }} !</h1>
      <form @submit.prevent="login" class="password-form">
        <input 
          type="password" 
          v-model="password" 
          placeholder="Mot de passe" 
          autofocus 
          class="password-input"
        />
        <button type="submit" class="btn-primary">Connexion</button>
        <button type="button" @click="selectedUser = null" class="btn-secondary">Retour</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { getProfileImageUrl } from '@/services/user-image-service';

const authStore = useAuthStore();
const themeStore = useThemeStore();

const publicUsers = ref<any[]>([]);
const selectedUser = ref<any>(null);
const password = ref('');

onMounted(async () => {
  try {
    publicUsers.value = await authStore.getPublicUsers();
  } catch (error) {
    console.error("Impossible de charger les profils publics", error);
  }
});

function selectProfile(user: any) {
  selectedUser.value = user;
  if (!user.hasPassword) {
    login();
  }
}

async function login() {
  try {
    await authStore.authenticateByName(selectedUser.value.name, password.value);
    window.location.href = '/'; 
  } catch (error) {
    alert("Mot de passe incorrect !");
  }
}

function getProfileImg(user: any) {
  return getProfileImageUrl(user);
}

function handleImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
}

.login-content {
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.login-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-shadow: 0 0 20px var(--accent-color);
  letter-spacing: 2px;
}

/* Grille Responsive Automatique */
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 40px;
  justify-items: center;
  align-items: start;
  padding: 20px;
}

.profile-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  max-width: 200px;
  outline: none;
}

.profile-card:hover,
.profile-card:focus {
  transform: scale(1.1) translateY(-5px);
}

.profile-card:focus {
  box-shadow: 0 0 30px var(--accent-color);
  border-radius: 50%;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--accent-color);
  margin-bottom: 15px;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.profile-card:hover .profile-avatar {
  box-shadow: 0 0 30px var(--accent-color), 0 8px 20px rgba(0, 0, 0, 0.4);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initials {
  font-size: 4rem;
  font-weight: bold;
  color: var(--accent-color);
  text-shadow: 0 0 20px var(--accent-color);
}

.profile-name {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  padding: 0 10px;
}

/* Formulaire de mot de passe */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
  margin: 40px auto 0;
  padding: 40px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 2px solid var(--accent-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.password-input {
  padding: 18px;
  border: 2px solid var(--accent-color);
  background: transparent;
  color: var(--text-color);
  border-radius: 10px;
  font-size: 1.2rem;
  text-align: center;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
}

.password-input:focus {
  box-shadow: 0 0 20px var(--accent-color);
}

.btn-primary,
.btn-secondary {
  padding: 18px;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--accent-color);
  color: #000;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-color);
}

.btn-secondary {
  background: transparent;
  color: var(--text-color);
  border: 2px solid var(--text-color);
}

.btn-secondary:hover {
  background: var(--text-color);
  color: var(--bg-color);
}

/* ========== RESPONSIVE MOBILE ========== */
@media (max-width: 768px) {
  .login-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .profiles-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 30px;
    padding: 10px;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
    border-width: 3px;
  }

  .profile-initials {
    font-size: 3rem;
  }

  .profile-name {
    font-size: 1rem;
  }

  .password-form {
    padding: 30px 20px;
  }
}

/* ========== RESPONSIVE TV (Grand écran) ========== */
@media (min-width: 1920px) {
  .profiles-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 60px;
  }

  .profile-avatar {
    width: 180px;
    height: 180px;
  }

  .profile-initials {
    font-size: 5rem;
  }

  .profile-name {
    font-size: 1.4rem;
  }

  .login-title {
    font-size: 3rem;
  }
}

/* ========== RESPONSIVE ULTRA-WIDE ========== */
@media (min-width: 2560px) {
  .profiles-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 80px;
  }
}
</style>