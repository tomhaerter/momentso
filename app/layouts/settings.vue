<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next"

const links = [
  {
    name: "Back",
    to: "/",
    icon: ArrowLeft
  }
]
</script>

<template>
  <div class="flex h-full max-h-screen flex-col sm:flex-row">
    <DPageSidebar :links="links" :footer-links="[]" />
    <main class="flex-1 overflow-scroll">
      <slot></slot>
    </main>
  </div>
</template>
