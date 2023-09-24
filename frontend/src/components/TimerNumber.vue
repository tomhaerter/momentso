<template>
  <div class="relative h-14 w-3 overflow-hidden">
    <Transition>
      <div v-if="number % 2" class="absolute top-1/2 translate-y-[-50%]">{{ number }}</div>
      <div v-else class="absolute top-1/2 translate-y-[-50%]">{{ number }}</div>
    </Transition>
  </div>
</template>


<style scoped>
.v-enter-active,
.v-leave-active {
  transform: translate(0, -50%);
  transition: all 0.5s ease;
  opacity: 1;
}

.v-enter-from {
  transform: translate(0, 20px);
  opacity: 0;
}

.v-leave-to {
  transform: translate(0, -40px);
  opacity: 0;
}
</style>


<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps<{ number: number }>()
</script>