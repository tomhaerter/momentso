<script setup lang="ts">
import { ConstructionIcon } from "lucide-vue-next"
</script>

<template>
  <div class="flex h-full w-full items-center justify-center p-4">
    <div class="mx-auto max-w-96 rounded-md border border-orange-100 bg-orange-100 p-8">
      <div class="mb-2 flex items-center gap-3 text-lg font-medium text-orange-900">
        <ConstructionIcon class="size-6 text-orange-900" />
        In Progress
      </div>
      <div class="mb-2 text-sm text-orange-800">This page is still under construction. Please check back at a later time.</div>
      <div class="text-sm text-orange-800">
        In case of emergency, please contact the support team at:
        <a href="mailto:support@momentso.com" class="font-medium text-orange-900 hover:underline">support@momentso.com</a>.
      </div>
    </div>
  </div>
</template>
