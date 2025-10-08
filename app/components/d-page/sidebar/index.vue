<script setup lang="ts">
import { useSessionStorage } from "@vueuse/core"
import { SchoolIcon, MenuIcon, PanelLeftClose, PanelRightClose } from "lucide-vue-next"

const route = useRoute()

interface Props {
  links: {
    name: string
    to: string
    icon: any
  }[]
  footerLinks: {
    name: string
    to: string
    icon: any
  }[]
}

const { links } = defineProps<Props>()

const collapsed = useSessionStorage("collapsed", false)

const isPublicRoute = computed(() => {
  return ["/login", "/logout"].includes(route.path)
})

const mobileMenu = ref(false)

const organisationName = ref("Momentso") // Kept from both files, no conflict

function toggleMobileMenu() {
  collapsed.value = false
  mobileMenu.value = !mobileMenu.value
}
</script>

<template>
  <div class="flex">
    <header v-if="!isPublicRoute" class="flex w-full border-b border-neutral-200 bg-neutral-50 sm:hidden">
      <div class="group flex h-14 w-full cursor-default items-center justify-between gap-2 rounded-md p-2 px-2 text-sm text-neutral-800">
        <router-link to="/entries" v-show="!collapsed" class="flex items-center gap-2 px-2 py-1.5">
          <school-icon class="size-4" />
          <div class="line-clamp-1 flex-1">{{ organisationName }}</div>
        </router-link>
        <div class="p-1" @click="toggleMobileMenu">
          <menu-icon class="size-4" />
        </div>
      </div>
    </header>

    <header class="hidden flex-col justify-between border-r border-neutral-200 bg-neutral-50 sm:flex" :class="collapsed ? 'w-fit' : 'w-[230px]'">
      <nav class="flex flex-col gap-0.5 p-2">
        <div class="group flex h-9 cursor-default items-center justify-between gap-2 rounded-md text-sm text-neutral-700">
          <div v-show="!collapsed" class="flex items-center gap-2 px-2 py-2">
            <SchoolIcon class="size-4" />
            <div class="line-clamp-1 flex-1">{{ organisationName }}</div>
          </div>
          <div
            class="hidden items-center rounded-md p-2 hover:bg-neutral-200 sm:flex"
            :class="collapsed ? '' : 'opacity-0 group-hover:opacity-100'"
            @click="collapsed = !collapsed"
          >
            <PanelLeftClose v-show="!collapsed" class="size-4" />
            <PanelRightClose v-show="collapsed" class="size-4" />
          </div>
        </div>
        <hr class="mt-1 mb-1.5 text-neutral-200" />
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          class="flex cursor-default items-center gap-2 rounded-md border px-2 py-1.5 text-sm text-neutral-500"
          :to="link.to"
          :class="route.path.startsWith(link.to) ? 'border-neutral-200 bg-white text-neutral-700 shadow-xs' : 'border-transparent hover:bg-neutral-200'"
        >
          <div class="flex h-5 items-center justify-center">
            <component :is="link.icon" class="size-4" />
          </div>
          <div v-show="!collapsed">{{ link.name }}</div>
        </NuxtLink>
      </nav>

      <div class="flex flex-col">
        <nav class="flex flex-col gap-0.5 p-2">
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.to"
            class="flex cursor-default items-center gap-2 rounded-md border px-2 py-1.5 text-sm text-neutral-500"
            :to="link.to"
            :class="route.path.startsWith(link.to) ? 'border-neutral-200 bg-white text-neutral-700 shadow-xs' : 'border-transparent hover:bg-neutral-200'"
          >
            <div class="flex h-5 items-center justify-center">
              <component :is="link.icon" class="size-4" />
            </div>
            <div v-show="!collapsed">{{ link.name }}</div>
          </NuxtLink>
        </nav>
      </div>
    </header>
  </div>
</template>
