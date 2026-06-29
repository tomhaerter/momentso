<script setup lang="ts">
import { LoaderCircleIcon } from "lucide-vue-next"

definePageMeta({ layout: "settings" })

const { user, fetch: refreshSession } = useUserSession()

const name = ref(user.value?.name ?? "")
const email = ref(user.value?.email ?? "")
const saving = ref(false)
const error = ref<string | null>(null)

async function save() {
  saving.value = true
  error.value = null
  try {
    await $fetch("/api/account", {
      method: "PUT",
      body: {
        name: name.value.trim(),
        email: email.value.trim().toLowerCase()
      }
    })
    await refreshSession()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Failed to save"
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Account</DHeaderTitle>
    </DHeader>
    <DPageContent>
      <div class="max-w-md space-y-6 p-4">
        <div class="space-y-2">
          <DLabel>Name</DLabel>
          <DInput v-model="name" placeholder="Your name" class="w-full" />
        </div>
        <div class="space-y-2">
          <DLabel>Email</DLabel>
          <DInput v-model="email" type="email" placeholder="you@example.com" class="w-full" />
        </div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <DButton variant="primary" :icon-left="saving ? LoaderCircleIcon : undefined" :loading="saving" @click="save">
          Save changes
        </DButton>
      </div>
    </DPageContent>
  </DPage>
</template>
