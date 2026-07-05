<!-- src/components/UserProfile.vue -->
<template>
  <div class="user-profile">
    <UserAvatar 
      :user-id="userId" 
      :user-name="userName"
      size="lg"
    />
    
    <div v-if="userName" class="profile-info">
      <h3>{{ userName }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';

defineProps<{
  userId: string;
  userName?: string;
}>();
</script>

<style scoped>
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--sao-surface-elevated);
  border-radius: var(--radius-lg);
}

.profile-info h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--sao-text);
  text-align: center;
}
</style>
