<script setup lang="ts">
import { LoaderCircleIcon } from "lucide-vue-next"

definePageMeta({ layout: "settings" })

const { data: workspace, refresh } = await useFetch("/api/workspaces/current")
const { refresh: refreshWorkspaces } = await useWorkspaces()

const name = ref(workspace.value?.name ?? "")
const saving = ref(false)
const error = ref<string | null>(null)

watch(workspace, (w) => {
  if (w) name.value = w.name
})

const isOwner = computed(() => workspace.value?.role === "owner")

async function save() {
  if (!workspace.value) return
  saving.value = true
  error.value = null
  try {
    await $fetch(`/api/workspaces/${workspace.value.id}`, {
      method: "PUT",
      body: { name: name.value.trim() }
    })
    await refresh()
    await refreshWorkspaces()
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
      <DHeaderTitle>Workspace</DHeaderTitle>
    </DHeader>
    <DPageContent>
      <div class="max-w-md space-y-6 p-4">
        <div class="space-y-2">
          <DLabel>Name</DLabel>
          <DInput v-model="name" :disabled="!isOwner" placeholder="Workspace name" class="w-full" />
        </div>
        <div v-if="!isOwner" class="text-sm text-neutral-500">
          Only workspace owners can rename the workspace.
        </div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <DButton
          v-if="isOwner"
          variant="primary"
          :icon-left="saving ? LoaderCircleIcon : undefined"
          :loading="saving"
          @click="save"
        >
          Save changes
        </DButton>
      </div>
    </DPageContent>
  </DPage>
</template>
