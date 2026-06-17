<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next"
import { RouterLink } from "vue-router"

const { data: clients, refresh } = await useFetch("/api/clients")

const showCreateModal = ref(false)
const newName = ref("")
const creating = ref(false)

async function createClient() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    await $fetch("/api/clients", {
      method: "POST",
      body: { name: newName.value.trim() }
    })
    newName.value = ""
    showCreateModal.value = false
    await refresh()
  } catch (error) {
    console.error(error)
  } finally {
    creating.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  newName.value = ""
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Clients</DHeaderTitle>
      <template #right>
        <DButton :icon-left="PlusIcon" variant="primary" @click="showCreateModal = true">New client</DButton>
      </template>
    </DHeader>

    <DPageContent>
      <DPageEmpty v-if="!clients?.length">No clients yet. Create one to get started.</DPageEmpty>
      <DTable v-else :columns="['1fr']">
        <template #header>
          <div class="text-sm font-medium text-neutral-900">Name</div>
        </template>

        <RouterLink
          v-for="client in clients"
          :key="client.id"
          :to="`/clients/${client.id}`"
          class="grid items-center gap-2 rounded px-2 py-2 hover:bg-neutral-100"
          style="grid-template-columns: 1fr"
        >
          <div class="line-clamp-1 text-sm font-medium text-neutral-900">{{ client.name }}</div>
        </RouterLink>
      </DTable>
    </DPageContent>

    <DModal v-if="showCreateModal" titel="New client" confirm-text="Create" @close="closeModal" @confirm="createClient">
      <div class="p-4">
        <DLabel>Name</DLabel>
        <DInput v-model="newName" placeholder="Client name" class="w-full" @keypress.enter="createClient" />
      </div>
    </DModal>
  </DPage>
</template>
