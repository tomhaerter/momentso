<script setup lang="ts">
import { MenuIcon } from "lucide-vue-next"

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

function isActive(to: string) {
  if (to === "/") return route.path === "/"
  return route.path.startsWith(to)
}

const isPublicRoute = computed(() => {
  return ["/login", "/logout"].includes(route.path)
})

const mobileMenu = ref(false)

function toggleMobileMenu() {
  mobileMenu.value = !mobileMenu.value
}
</script>

<template>
  <div class="flex">
    <header v-if="!isPublicRoute" class="flex w-full border-b border-neutral-200 bg-neutral-50 sm:hidden">
      <div class="group flex h-14 w-full cursor-default items-center justify-between gap-2 rounded-md p-2 px-2 text-sm text-neutral-800">
        <WorkspaceSwitcher />
        <div class="p-1" @click="toggleMobileMenu">
          <MenuIcon class="size-4" />
        </div>
      </div>
    </header>

    <header class="hidden w-[230px] flex-col justify-between border-r border-neutral-200 bg-neutral-50 sm:flex">
      <nav class="flex flex-col gap-0.5 py-2">
        <div class="px-2">
          <WorkspaceSwitcher />
        </div>
        <hr class="mt-2 border-neutral-200" />
        <div class="flex flex-col gap-0.5 px-2 pt-2">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            class="flex cursor-default items-center gap-2 rounded-md border px-2 py-1.5 text-sm text-neutral-500"
            :to="link.to"
            :class="isActive(link.to) ? 'border-neutral-200 bg-white text-neutral-700 shadow-xs' : 'border-transparent hover:bg-neutral-200'"
          >
            <div class="flex h-5 items-center justify-center">
              <component :is="link.icon" class="size-4" />
            </div>
            <div>{{ link.name }}</div>
          </NuxtLink>
        </div>
      </nav>

      <div class="flex flex-col">
        <nav class="flex flex-col gap-0.5 p-2">
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.to"
            class="flex cursor-default items-center gap-2 rounded-md border px-2 py-1.5 text-sm text-neutral-500"
            :to="link.to"
            :class="isActive(link.to) ? 'border-neutral-200 bg-white text-neutral-700 shadow-xs' : 'border-transparent hover:bg-neutral-200'"
          >
            <div class="flex h-5 items-center justify-center">
              <component :is="link.icon" class="size-4" />
            </div>
            <div>{{ link.name }}</div>
          </NuxtLink>
        </nav>
      </div>
    </header>
  </div>
</template>
