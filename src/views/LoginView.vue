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
      <h1>Choisis ton profil</h1>
      <div class="profiles-grid">
        <div 
          v-for="user in publicUsers" 
          :key="user.id" 
          class="profile-card"
          @click="selectProfile(user)"
        >
          <div class="profile-avatar">
            <img 
              v-if="getProfileImg(user)" 
              :src="getProfileImg(user)" 
              :alt="user.name" 
              @error="handleImageError"
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
      <h1>Bonjour {{ selectedUser.name }} !</h1>
      <form @submit.prevent="login" class="password-form">
        <input 
          type="password" 
          v-model="password" 
          placeholder="Mot de passe" 
          autofocus 
        />
        <button type="submit">Connexion</button>
        <button type="button" @click="selectedUser = null" class="back-btn">Retour</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import { getProfileImageUrl } from '../services/user-image-service';

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
  padding: 20px;
}

.login-content {
  text-align: center;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.profile-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.profile-card:hover {
  transform: scale(1.05);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--accent-color);
  margin-bottom: 10px;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initials {
  font-size: 3rem;
  font-weight: bold;
  color: var(--accent-color);
}

.profile-name {
  font-size: 1.2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
  margin: 20px auto;
}

.password-form input {
  padding: 15px;
  border: 2px solid var(--accent-color);
  background: transparent;
  color: var(--text-color);
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  font-family: inherit;
}

.password-form button {
  padding: 15px;
  background: var(--accent-color);
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
}

.back-btn {
  background: transparent !important;
  color: var(--text-color) !important;
  border: 1px solid var(--text-color) !important;
}
</style>