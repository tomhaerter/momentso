<script setup lang="ts">
import { ChevronsUpDownIcon, CheckIcon, PlusIcon } from "lucide-vue-next"
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "reka-ui"

const { user } = useUserSession()

const { data: workspaces, refresh: refreshWorkspaces } = await useWorkspaces()

const currentWorkspaceName = computed(() => {
  const ws = workspaces.value?.find((w) => w.id === user.value?.workspaceId)
  return ws?.name ?? "Workspace"
})

const switching = ref(false)

async function switchWorkspace(id: string) {
  if (id === user.value?.workspaceId) return
  switching.value = true
  try {
    await $fetch("/api/workspaces/switch", {
      method: "POST",
      body: { workspaceId: id }
    })
    // Reload the page to reset all state
    window.location.href = "/"
  } catch (error) {
    console.error("Failed to switch workspace:", error)
  } finally {
    switching.value = false
  }
}

const showCreateModal = ref(false)
const newName = ref("")

async function createWorkspace() {
  if (!newName.value.trim()) return
  try {
    await $fetch("/api/workspaces", {
      method: "POST",
      body: { name: newName.value.trim() }
    })
    newName.value = ""
    showCreateModal.value = false
    await refreshWorkspaces()
  } catch (error) {
    console.error(error)
  }
}

function closeModal() {
  showCreateModal.value = false
  newName.value = ""
}
</script>

<template>
  <div>
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        class="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 outline-none hover:bg-neutral-200 data-[state=open]:bg-neutral-200"
      >
        <div class="flex size-5 items-center justify-center rounded bg-neutral-300 text-xs font-semibold text-neutral-600">
          {{ currentWorkspaceName.charAt(0).toUpperCase() }}
        </div>
        <div class="line-clamp-1 flex-1 text-left">{{ currentWorkspaceName }}</div>
        <ChevronsUpDownIcon class="size-3.5 shrink-0 text-neutral-400" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          :side-offset="4"
          align="start"
          class="z-100 min-w-[200px] rounded-md border border-neutral-200 bg-white p-1 text-sm shadow"
        >
          <DropdownMenuItem
            v-for="ws in workspaces"
            :key="ws.id"
            class="flex cursor-default items-center justify-between gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-neutral-100"
            @select="switchWorkspace(ws.id)"
          >
            <span class="line-clamp-1">{{ ws.name }}</span>
            <CheckIcon v-if="ws.id === user?.workspaceId" class="size-4 shrink-0 text-neutral-500" />
          </DropdownMenuItem>
          <DropdownMenuSeparator class="my-1 h-px bg-neutral-200" />
          <DropdownMenuItem
            class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-neutral-100"
            @select="showCreateModal = true"
          >
            <PlusIcon class="size-4" />
            <span>New workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <DModal v-if="showCreateModal" titel="New workspace" confirm-text="Create" @close="closeModal" @confirm="createWorkspace">
      <div class="p-4">
        <DLabel>Name</DLabel>
        <DInput v-model="newName" placeholder="Workspace name" class="w-full" @keypress.enter="createWorkspace" />
      </div>
    </DModal>
  </div>
</template>
