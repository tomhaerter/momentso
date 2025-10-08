<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref("")
const loading = ref(false)
const success = ref(false)

async function requestPasswordReset() {
  loading.value = true
  try {
    await $fetch("/api/forgot-password", {
      method: "POST",
      body: {
        email: email.value
      }
    })
    success.value = true
  } catch (e: any) {
    // const statusCode = e.statusCode
    if (e.statusCode === 429) {
      // handle rate limit error
      alert("Es wurden zu viele Anfragen gestellt. Bitte versuche es später noch einmal.")
    } else {
      alert("Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später noch einmal.")
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100 px-8 pt-24">
    <div class="mx-auto max-w-sm rounded-lg border border-neutral-50 bg-white p-8 shadow">
      <h1 class="mb-4 text-center text-2xl font-semibold text-neutral-900">Forgot your password?</h1>

      <form v-if="!success" @submit.prevent="requestPasswordReset" class="flex flex-col gap-4">
        <p class="text-sm text-neutral-700">We will send you an email with a link to reset your password.</p>
        <div class="flex flex-col gap-1">
          <DLabel for="email">Email</DLabel>
          <DInput v-model="email" type="email" autocomplete="off" id="email" name="email" required placeholder="Your email address" />
        </div>
        <div class="flex flex-col gap-2">
          <DButton type="submit" text-center>Request link</DButton>
          <DButton to="/login" variant="secondary" text-center>Back to login</DButton>
        </div>
      </form>
      <div v-else class="flex flex-col gap-2">
        <p class="text-sm text-neutral-700">If your user exists, you will receive an email with a link to reset your password.</p>
        <DButton to="/login" text-center>Back to login</DButton>
      </div>
    </div>
  </div>
</template>
