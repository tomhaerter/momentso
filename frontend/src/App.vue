<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="px-4 py-2 flex gap-2">
    <RouterLink class="p-2 bg-gray-100" to="/">Home</RouterLink>
    <RouterLink class="p-2 bg-gray-100" to="/login">Login</RouterLink>
    <RouterLink class="p-2 bg-gray-100" to="/signup">Sign up</RouterLink>
  </nav>

  <main class="p-4">
    <RouterView />
  </main>
</template>

<style scoped>
.router-link-exact-active {
  @apply bg-gray-900 text-white;
}
</style>