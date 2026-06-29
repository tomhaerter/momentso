<script setup lang="ts">
import { PlusIcon, MoreVerticalIcon } from "lucide-vue-next"

definePageMeta({ layout: "settings" })

const { user } = useUserSession()
const { data: workspace } = await useFetch("/api/workspaces/current")
const { data: members, refresh: refreshMembers } = await useFetch("/api/workspaces/members")
const { data: invites, refresh: refreshInvites } = await useFetch("/api/workspaces/invites")

const isOwner = computed(() => workspace.value?.role === "owner")

const showInviteModal = ref(false)
const inviteEmail = ref("")
const inviteError = ref<string | null>(null)
const inviting = ref(false)

async function sendInvite() {
  inviteError.value = null
  if (!inviteEmail.value.trim()) return
  inviting.value = true
  try {
    await $fetch("/api/workspaces/invites", {
      method: "POST",
      body: { email: inviteEmail.value.trim().toLowerCase() }
    })
    inviteEmail.value = ""
    showInviteModal.value = false
    await refreshInvites()
  } catch (e: any) {
    inviteError.value = e?.data?.message || e?.message || "Failed to send invite"
  } finally {
    inviting.value = false
  }
}

function closeInviteModal() {
  showInviteModal.value = false
  inviteEmail.value = ""
  inviteError.value = null
}

const memberMenuItems = (m: { id: string, accountId: string, role: string }) => {
  if (m.accountId === user.value?.id) return []
  return [
    { label: m.role === "owner" ? "Change to member" : "Change to owner" },
    { separator: true },
    { label: "Remove", danger: true }
  ]
}

async function onMemberSelect(m: { id: string, accountId: string, role: string }, index: number) {
  const items = memberMenuItems(m)
  const item = items[index]
  if (!item) return
  if (item.label === "Change to owner") {
    await $fetch(`/api/workspaces/members/${m.id}`, { method: "PUT", body: { role: "owner" } })
    await refreshMembers()
  } else if (item.label === "Change to member") {
    await $fetch(`/api/workspaces/members/${m.id}`, { method: "PUT", body: { role: "member" } })
    await refreshMembers()
  } else if (item.label === "Remove") {
    await $fetch(`/api/workspaces/members/${m.id}`, { method: "DELETE" })
    await refreshMembers()
  }
}

async function revokeInvite(id: string) {
  await $fetch(`/api/workspaces/invites/${id}`, { method: "DELETE" })
  await refreshInvites()
}

async function leaveWorkspace() {
  const res = await $fetch("/api/workspaces/members/leave", { method: "POST" })
  if (res.redirect === "/logout") {
    await navigateTo("/logout")
  } else if (res.redirect === "/api/workspaces/switch") {
    await $fetch("/api/workspaces/switch", { method: "POST", body: { workspaceId: res.workspaceId } })
    await navigateTo("/")
  }
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Members</DHeaderTitle>
      <template v-if="isOwner" #right>
        <DButton :icon-left="PlusIcon" variant="primary" @click="showInviteModal = true">Invite member</DButton>
      </template>
    </DHeader>
    <DPageContent>
      <DTable :columns="['2fr', '2fr', '1fr', 'auto']">
        <template #header>
          <div class="text-sm font-medium text-neutral-900">Name</div>
          <div class="text-sm font-medium text-neutral-900">Email</div>
          <div class="text-sm font-medium text-neutral-900">Role</div>
          <div></div>
        </template>
        <div
          v-for="m in members"
          :key="m.id"
          class="grid items-center gap-2 rounded px-2 py-2 hover:bg-neutral-100"
          style="grid-template-columns: 2fr 2fr 1fr auto"
        >
          <div class="text-sm font-medium text-neutral-900">{{ m.name }}<span v-if="m.accountId === user?.id" class="text-neutral-400"> (you)</span></div>
          <div class="text-sm text-neutral-600">{{ m.email }}</div>
          <div class="text-sm text-neutral-600 capitalize">{{ m.role }}</div>
          <div>
            <DMenu
              v-if="isOwner && m.accountId !== user?.id"
              :items="memberMenuItems(m)"
              @select="(i) => onMemberSelect(m, i)"
            />
          </div>
        </div>
      </DTable>

      <!-- Pending invites -->
      <div v-if="isOwner && invites?.length" class="mt-8 px-4">
        <div class="mb-2 text-sm font-medium text-neutral-900">Pending invites</div>
        <div class="space-y-1">
          <div
            v-for="inv in invites"
            :key="inv.id"
            class="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 px-3 py-2"
          >
            <div>
              <div class="text-sm font-medium text-neutral-900">{{ inv.email }}</div>
              <div class="text-xs text-neutral-500">Expires {{ new Date(inv.expiresAt).toLocaleDateString() }}</div>
            </div>
            <DButton variant="secondary" size="sm" @click="revokeInvite(inv.id)">Revoke</DButton>
          </div>
        </div>
      </div>

      <!-- Leave workspace -->
      <div v-if="!isOwner" class="mt-8 px-4">
        <DButton variant="danger-light" @click="leaveWorkspace">Leave workspace</DButton>
      </div>
    </DPageContent>

    <DModal
      v-if="showInviteModal"
      titel="Invite member"
      confirm-text="Send invite"
      @close="closeInviteModal"
      @confirm="sendInvite"
    >
      <div class="space-y-4 p-4">
        <div>
          <DLabel>Email</DLabel>
          <DInput
            v-model="inviteEmail"
            type="email"
            placeholder="they@example.com"
            class="w-full"
            @keypress.enter="sendInvite"
          />
        </div>
        <div v-if="inviteError" class="text-sm text-red-600">{{ inviteError }}</div>
      </div>
    </DModal>
  </DPage>
</template>
