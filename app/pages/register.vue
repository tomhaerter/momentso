<script setup lang="ts">
definePageMeta({
  layout: false
})

const name = ref("")
const email = ref("")
const password = ref("")

const errorMsg = ref("") // Add error message
const success = ref(false)
const loading = ref(false) // Add loading state

async function register() {
  try {
    loading.value = true // Set loading to true
    errorMsg.value = "" // Reset error message
    success.value = false // Reset success

    await $fetch("/api/register", {
      method: "POST",
      body: {
        name: name.value,
        email: email.value,
        password: password.value
      }
    })
    success.value = true
  } catch (e: any) {
    // Catch the error to display to user
    errorMsg.value = e.data?.message || "An error occurred." // Access error message. Use a generic message if not available
  } finally {
    loading.value = false // Set loading back to false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100 px-8 pt-24">
    <div class="mx-auto max-w-sm rounded-lg border border-neutral-50 bg-white p-8 shadow">
      <h1 class="mb-4 text-center text-2xl font-semibold text-neutral-900">Momentso</h1>

      <div v-if="success">
        <h2 class="text-center text-lg font-semibold text-green-600">Successfully registered!</h2>
        <p class="text-center text-sm text-neutral-500">Please check your email for the confirmation link.</p>
        <p class="mt-4 text-center text-sm text-neutral-500">
          <NuxtLink to="/login" class="hover:underline">To Login</NuxtLink>
        </p>
      </div>

      <form v-else @submit.prevent="register" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <d-label for="name">Name</d-label>
          <d-input v-model="name" type="text" id="name" name="name" required placeholder="Your name" />
        </div>
        <div class="flex flex-col gap-1">
          <d-label for="email">Email</d-label>
          <d-input v-model="email" type="email" id="email" name="email" required placeholder="Your email address" />
        </div>
        <div class="flex flex-col gap-1">
          <d-label for="password">Password</d-label>
          <d-input v-model="password" type="password" id="password" name="password" required placeholder="Your password" />
        </div>

        <d-button :loading="loading" type="submit" class="items-center justify-center bg-black text-white"> Register </d-button>
        <div v-if="errorMsg" class="mb-2 rounded-md bg-red-100 px-4 py-2 text-center text-sm text-red-600">
          {{ errorMsg }}
        </div>
        <p class="text-center text-sm text-neutral-500">Already registered? <NuxtLink to="/login" class="hover:underline">Login</NuxtLink></p>
      </form>
    </div>
  </div>
</template>
