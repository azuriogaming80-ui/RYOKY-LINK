<!-- src/components/detail/ActionButtons.vue -->
<template>
  <div class="action-buttons">
    <button class="action-btn btn-primary" @click="$emit('play')">
      <span class="btn-icon">▶</span>
      <span class="btn-label">{{ playLabel }}</span>
    </button>

    <button 
      class="action-btn btn-secondary"
      :class="{ active: isFavorite }"
      @click="$emit('toggleFavorite')"
    >
      <span class="btn-icon">{{ isFavorite ? '♥' : '♡' }}</span>
    </button>

    <button 
      class="action-btn btn-secondary"
      :class="{ active: isPlayed }"
      @click="$emit('togglePlayed')"
    >
      <span class="btn-icon">✓</span>
    </button>

    <button class="action-btn btn-secondary" @click="$emit('addToList')">
      <span class="btn-icon">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isFavorite?: boolean;
  isPlayed?: boolean;
  playLabel?: string;
}

withDefaults(defineProps<Props>(), {
  playLabel: 'Lecture',
  isFavorite: false,
  isPlayed: false,
});

defineEmits(['play', 'toggleFavorite', 'togglePlayed', 'addToList']);
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--sao-cyan);
  color: var(--sao-bg);
  border-color: var(--sao-cyan);
}

.btn-primary:hover {
  background: var(--sao-amber);
  border-color: var(--sao-amber);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--sao-text);
  border-color: rgba(255, 255, 255, 0.1);
  min-width: 48px;
  justify-content: center;
  padding: 12px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--sao-cyan);
}

.btn-secondary.active {
  color: var(--sao-amber);
  border-color: var(--sao-amber);
}

.btn-icon {
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .action-buttons {
    gap: 8px;
  }
  
  .action-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .btn-secondary {
    min-width: 44px;
    padding: 10px;
  }
}
</style>