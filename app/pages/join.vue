<script setup lang="ts">
import { CheckCircle2Icon, XCircleIcon, LoaderCircleIcon } from "lucide-vue-next"

definePageMeta({ layout: false })

const route = useRoute()
const token = computed(() => (route.query.token as string) || "")
const { loggedIn, user, fetch: refreshSession } = useUserSession()

const { data: invite, pending, error } = await useFetch("/api/invites/validate", {
  query: { token },
  immediate: !!token.value
})

const accepting = ref(false)
const acceptError = ref<string | null>(null)

async function accept() {
  accepting.value = true
  acceptError.value = null
  try {
    await $fetch("/api/invites/accept", {
      method: "POST",
      body: { token: token.value }
    })
    await refreshSession()
    await navigateTo("/")
  } catch (e: any) {
    acceptError.value = e?.data?.message || e?.message || "Failed to accept invite"
  } finally {
    accepting.value = false
  }
}

const emailMismatch = computed(() => {
  return loggedIn.value && invite.value?.valid && user.value?.email.toLowerCase() !== invite.value.email.toLowerCase()
})

const canAccept = computed(() => {
  return loggedIn.value && invite.value?.valid && !emailMismatch.value
})
</script>

<template>
  <div class="min-h-screen bg-neutral-100 px-8 pt-24">
    <div class="mx-auto max-w-sm rounded-lg border border-neutral-50 bg-white p-8 shadow">
      <h1 class="mb-4 text-center text-2xl font-semibold text-neutral-900">Momentso</h1>

      <!-- Loading -->
      <div v-if="pending" class="flex items-center justify-center gap-2 py-8 text-neutral-500">
        <LoaderCircleIcon class="size-4 animate-spin" />
        <span class="text-sm">Validating invite...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error || !invite?.valid" class="space-y-4 py-4 text-center">
        <XCircleIcon class="mx-auto size-10 text-red-500" />
        <div class="space-y-1">
          <div class="text-sm font-medium text-neutral-900">Invite unavailable</div>
          <div v-if="invite?.reason === 'expired'" class="text-sm text-neutral-500">This invite has expired. Ask the workspace owner to send a new one.</div>
          <div v-else-if="invite?.reason === 'accepted'" class="text-sm text-neutral-500">This invite has already been used.</div>
          <div v-else class="text-sm text-neutral-500">This invite link is invalid. Ask the workspace owner to send a new one.</div>
        </div>
        <DButton to="/" variant="secondary">Go home</DButton>
      </div>

      <!-- Valid invite -->
      <div v-else class="space-y-6 py-2">
        <div class="space-y-2 text-center">
          <CheckCircle2Icon class="mx-auto size-10 text-green-500" />
          <div class="text-sm font-medium text-neutral-900">You've been invited!</div>
          <div class="text-sm text-neutral-500">
            Join the <strong class="text-neutral-900">{{ invite.workspaceName }}</strong> workspace on Momentso.
          </div>
        </div>

        <!-- Email mismatch -->
        <div v-if="emailMismatch" class="space-y-3 rounded-md bg-neutral-50 p-4 text-center">
          <div class="text-sm text-neutral-700">
            This invite was sent to <strong>{{ invite.email }}</strong>
          </div>
          <div class="text-sm text-neutral-500">
            You're logged in as <strong>{{ user?.email }}</strong>. Log out and sign in with the correct email to accept.
          </div>
          <DButton to="/logout" variant="secondary" class="w-full">Log out</DButton>
        </div>

        <!-- Not logged in -->
        <div v-else-if="!loggedIn" class="space-y-3">
          <div class="text-center text-sm text-neutral-500">
            Sign in or create an account with <strong>{{ invite.email }}</strong> to join.
          </div>
          <DButton to="/login?redirect=/join?token={{ token }}" variant="primary" class="w-full">Sign in</DButton>
          <DButton :to="`/register?email=${invite.email}&redirect=/join?token=${token}`" variant="secondary" class="w-full">Create account</DButton>
        </div>

        <!-- Logged in with matching email -->
        <div v-else class="space-y-3">
          <div class="rounded-md bg-green-50 p-4 text-center text-sm text-green-700">
            Logged in as {{ user?.email }}
          </div>
          <DButton variant="primary" :loading="accepting" :icon-left="accepting ? LoaderCircleIcon : undefined" class="w-full" @click="accept">Accept invite</DButton>
          <div v-if="acceptError" class="text-center text-sm text-red-600">{{ acceptError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
