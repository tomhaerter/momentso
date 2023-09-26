<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'


const router = useRouter()

async function signOut() {
  localStorage.removeItem('token')
  await router.push('/login')
}

</script>

<template>
  <nav class="px-4 py-2 flex gap-2" v-if="$route.name !== 'signup' && $route.name !== 'login'">
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/">Home</RouterLink>
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/login">Login</RouterLink>
    <RouterLink class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/signup">Sign up</RouterLink>
    <button @click="signOut" class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm" to="/signup">Sign out</button>
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