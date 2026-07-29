<script setup lang="ts">
import { CalendarIcon } from "lucide-vue-next"

const { label = "Choose date" } = defineProps<{ label?: string }>()
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ change: [] }>()
</script>

<template>
  <label
    class="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-400 outline-none focus-within:ring-2 focus-within:ring-blue-600 hover:bg-neutral-200 hover:text-neutral-600"
    :title="model ? `${label}: ${model}` : label"
  >
    <CalendarIcon class="pointer-events-none size-4" />
    <input v-model="model" type="date" :aria-label="label" class="absolute inset-0 size-full cursor-pointer opacity-0" @change="emit('change')" />
  </label>
</template>
