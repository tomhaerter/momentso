<script setup lang="ts">
import {
  PenIcon,
  UsersIcon,
  GridIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  TagsIcon,
  LogOutIcon,
  Settings2Icon,
  UserCheckIcon,
  Clock10Icon,
  FolderKanbanIcon,
  Building2Icon
} from "lucide-vue-next"

const links = [
  {
    name: "Time Tracker",
    to: "/",
    icon: Clock10Icon
  },
  {
    name: "Projects",
    to: "/projects",
    icon: FolderKanbanIcon
  },
  {
    name: "Clients",
    to: "/clients",
    icon: Building2Icon
  }
]

const footerLinks = [
  {
    name: "Settings",
    to: "/settings",
    icon: Settings2Icon
  },
  {
    name: "Log Out",
    to: "/logout",
    icon: LogOutIcon
  }
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
