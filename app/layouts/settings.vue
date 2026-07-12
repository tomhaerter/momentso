<script setup lang="ts">
import { ArrowLeftIcon, UserIcon, Building2Icon, UsersIcon } from "lucide-vue-next"

const links = [
  { name: "Account", to: "/settings/account", icon: UserIcon },
  { name: "Workspace", to: "/settings/workspace", icon: Building2Icon },
  { name: "Members", to: "/settings/members", icon: UsersIcon }
]

const footerLinks = [
  { name: "Back", to: "/", icon: ArrowLeftIcon }
]
</script>

<template>
  <div class="flex h-full max-h-screen flex-col sm:flex-row">
    <DPageSidebar :links="links" :footer-links="footerLinks" />
    <main class="flex-1 overflow-auto">
      <slot></slot>
    </main>
  </div>
</template>
