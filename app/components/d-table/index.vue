<script setup lang="ts">
const props = defineProps<{
  columns: string[]
}>()

const gridTemplate = computed(() => props.columns.join(" "))
</script>

<template>
  <div class="block min-h-0 px-4 pt-2.5">
    <div
      class="grid items-center justify-between gap-4 border-b border-neutral-200 px-2 pb-2"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <slot name="header" />
    </div>
    <div class="pt-1">
      <slot />
    </div>
  </div>
</template>
