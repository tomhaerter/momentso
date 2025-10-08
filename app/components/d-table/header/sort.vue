<script setup lang="ts" generic="T extends string">
import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon, ArrowUpDownIcon } from "lucide-vue-next"

interface Props {
  sortBy: T
  sortField: T
  sortOrder: string
}

const { sortField } = defineProps<Props>()

const emit = defineEmits<{ (e: "sort", key: T): void }>()

function sort(key: T) {
  emit("sort", key)
}
</script>

<template>
  <template v-if="sortBy === sortField">
    <template v-if="sortOrder === 'desc'">
      <DButton size="sm" variant="secondary" :icon-left="ArrowDownNarrowWideIcon" class="!p-1" @click="sort(sortField)"></DButton>
    </template>
    <template v-else>
      <DButton size="sm" variant="secondary" :icon-left="ArrowUpNarrowWideIcon" class="!p-1" @click="sort(sortField)"></DButton>
    </template>
  </template>
  <template v-else>
    <DButton size="sm" variant="transparent" :icon-left="ArrowUpDownIcon" class="!p-1" @click="sort(sortField)"></DButton>
  </template>
</template>
