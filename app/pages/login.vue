<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref("")
const password = ref("")
const errorMsg = ref("")
const loading = ref(false)

const { fetch: refreshSession } = useUserSession()

async function login() {
  try {
    loading.value = true
    errorMsg.value = ""
    await $fetch("/api/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value
      }
    })
    await refreshSession()
    await navigateTo("/")
  } catch (e) {
    errorMsg.value = "Invalid credentials"
    loading.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100 px-8 pt-24">
    <div class="mx-auto max-w-sm rounded-lg border border-neutral-50 bg-white p-8 shadow">
      <h1 class="mb-4 text-center text-2xl font-semibold text-neutral-900">Momentso</h1>

      <form @submit.prevent="login" class="flex flex-col gap-2.5">
        <div class="flex flex-col gap-1">
          <d-label for="email">Email</d-label>
          <d-input v-model="email" type="email" id="email" name="email" required placeholder="Your email address" />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <d-label for="password">Password</d-label>
            <NuxtLink to="/forgot-password" class="text-xs text-neutral-500 hover:underline">Reset password</NuxtLink>
          </div>
          <d-input v-model="password" type="password" id="password" name="password" required placeholder="Your password" />
        </div>
        <d-button :loading type="submit" variant="primary" class="w-full">Sign In</d-button>
        <d-button to="/register" type="submit" variant="secondary" class="w-full">Sign Up</d-button>
        <div v-if="errorMsg" class="mb-2 rounded-md bg-red-100 px-4 py-2 text-center text-sm text-red-600">
          {{ errorMsg }}
        </div>
      </form>
    </div>
  </div>
</template>
