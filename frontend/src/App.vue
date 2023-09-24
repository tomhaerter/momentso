<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="px-4 py-2 flex gap-2">
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/">Home</RouterLink>
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/login">Login</RouterLink>
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/signup">Sign up</RouterLink>
  </nav>

  <main class="p-4">
    <RouterView />
  </main>
</template>

<style scoped>
.router-link-exact-active {
  @apply bg-accent-default text-neutral-inverted;
}
</style>