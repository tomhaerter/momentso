<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"

const { data: projects, refresh } = await useFetch("/api/projects")
const { data: clients } = await useFetch("/api/clients")

const clientById = computed(() => {
  const map = new Map<string, string>()
  for (const c of clients.value ?? []) {
    map.set(c.id, c.name)
  }
  return map
})

const clientOptions = computed(() => [{ value: null, display: "No client" }, ...(clients.value ?? []).map((c) => ({ value: c.id, display: c.name }))])

async function saveClient(projectId: string, clientId: string | null) {
  try {
    await $fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      body: { clientId }
    })
    await refresh()
  } catch (error) {
    console.error("Failed to save client:", error)
  }
}

async function saveColor(projectId: string, color: string) {
  try {
    await $fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      body: { color }
    })
    await refresh()
  } catch (error) {
    console.error("Failed to save color:", error)
  }
}

const showCreateModal = ref(false)
const newName = ref("")
const newColor = ref("gray")
const newClientId = ref<string | null>(null)
const creating = ref(false)

async function createProject() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    await $fetch("/api/projects", {
      method: "POST",
      body: {
        name: newName.value.trim(),
        color: newColor.value,
        clientId: newClientId.value
      }
    })
    resetForm()
    showCreateModal.value = false
    await refresh()
  } catch (error) {
    console.error(error)
  } finally {
    creating.value = false
  }
}

function resetForm() {
  newName.value = ""
  newColor.value = "gray"
  newClientId.value = null
}

function closeModal() {
  showCreateModal.value = false
  resetForm()
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Projects</DHeaderTitle>
      <template #right>
        <DButton :icon-left="PlusIcon" variant="primary" @click="showCreateModal = true">New project</DButton>
      </template>
    </DHeader>

    <DPageContent>
      <DPageEmpty v-if="!projects?.length">No projects yet. Create one to get started.</DPageEmpty>
      <DTable v-else :columns="['2fr', '1fr', '1fr']">
        <template #header>
          <div class="border-r border-neutral-200 text-sm font-medium text-neutral-900">Name</div>
          <div class="border-r border-neutral-200 text-sm font-medium text-neutral-900">Color</div>
          <div class="text-sm font-medium text-neutral-900">Client</div>
        </template>

        <div
          v-for="project in projects"
          :key="project.id"
          class="grid items-center gap-2 rounded px-2 py-2 hover:bg-neutral-100"
          style="grid-template-columns: 2fr 1fr 1fr"
        >
          <RouterLink :to="`/projects/${project.id}`" class="line-clamp-1 text-sm font-medium text-neutral-900">
            {{ project.name }}
          </RouterLink>
          <DSelect
            :model-value="project.color"
            :options="colorOptions"
            placeholder="gray"
            @update:model-value="(v: string | null | undefined) => saveColor(project.id, v ?? 'gray')"
          >
            <template #trigger="{ option }">
              <div class="flex items-center gap-2">
                <div class="size-3 shrink-0 rounded-full" :class="colorDotClass(option?.display ?? 'gray')" />
                <span class="capitalize">{{ option?.display ?? "gray" }}</span>
              </div>
            </template>
            <template #item="{ option }">
              <div class="flex items-center gap-2">
                <div class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.display)" />
                <span class="capitalize">{{ option.display }}</span>
              </div>
            </template>
          </DSelect>
          <DSelect
            :model-value="project.clientId"
            :options="clientOptions"
            placeholder="No client"
            class="w-full"
            @update:model-value="(v: string | null | undefined) => saveClient(project.id, v ?? null)"
          />
        </div>
      </DTable>
    </DPageContent>

    <DModal v-if="showCreateModal" titel="New project" confirm-text="Create" @close="closeModal" @confirm="createProject">
      <div class="space-y-4 p-4">
        <div>
          <DLabel>Name</DLabel>
          <DInput v-model="newName" placeholder="Project name" class="w-full" @keypress.enter="createProject" />
        </div>
        <div>
          <DLabel>Color</DLabel>
          <DSelect v-model="newColor" :options="colorOptions" placeholder="gray">
            <template #trigger="{ option }">
              <div class="flex items-center gap-2">
                <div class="size-3 shrink-0 rounded-full" :class="colorDotClass(option?.display ?? 'gray')" />
                <span class="capitalize">{{ option?.display ?? "gray" }}</span>
              </div>
            </template>
            <template #item="{ option }">
              <div class="flex items-center gap-2">
                <div class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.display)" />
                <span class="capitalize">{{ option.display }}</span>
              </div>
            </template>
          </DSelect>
        </div>
        <div v-if="clientOptions.length > 1">
          <DLabel>Client</DLabel>
          <DSelect v-model="newClientId" placeholder="No client" :options="clientOptions" />
        </div>
      </div>
    </DModal>
  </DPage>
</template>
