<!-- src/components/UserAvatar.vue -->
<template>
  <div class="user-avatar" :style="{ width: sizeValue, height: sizeValue }">
    <img 
      v-if="imageUrl && !imgError" 
      :src="imageUrl" 
      :alt="altText"
      class="avatar-img"
      @error="handleImgError"
    />
    <div v-else class="avatar-fallback">
      <span>{{ initials }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useImageUrl } from '@/composables/useImageUrl';

interface Props {
  userId: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

const { getUserProfileImage } = useImageUrl();
const imgError = ref(false);

const sizeMap = {
  sm: 64,
  md: 128,
  lg: 256,
};

const sizeValue = computed(() => {
  const size = props.width || sizeMap[props.size];
  return `${size}px`;
});

const imageUrl = computed(() => {
  if (!props.userId || imgError.value) return '';
  const size = props.width || sizeMap[props.size];
  return getUserProfileImage(props.userId, {
    width: size,
    height: size,
  });
});

const initials = computed(() => {
  if (!props.userName) return '?';
  return props.userName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
});

const altText = computed(() => {
  return `Avatar de ${props.userName || 'utilisateur'}`;
});

const handleImgError = () => {
  imgError.value = true;
};
</script>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--sao-surface);
}

.avatar-img {
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
  font-weight: 600;
  font-size: 0.875rem;
  background: linear-gradient(135deg, var(--sao-cyan), var(--sao-cyan-glow));
  color: white;
}
</style>
