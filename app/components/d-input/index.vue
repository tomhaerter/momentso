<script setup lang="ts">
interface Props {
  type?: string
  placeholder?: string | undefined
  error?: string | undefined // Add error prop
}

const { type = "text", placeholder = undefined, error = undefined } = defineProps<Props>()

const model = defineModel()

// Computed class to dynamically add error styling
const inputClass = computed(() => {
  return [
    "rounded-md",
    // "bg-neutral-100",
    "border",
    "border-neutral-200",
    "text-neutral-900",
    "placeholder:text-neutral-500",
    "px-2",
    "py-1.5",
    "text-sm",
    "ring-blue-600",
    "outline-none",
    "focus:border-transparent",
    "focus:ring-2",
    error ? "ring-2 ring-red-500" : "focus:ring-blue-600" // Conditional error styling
  ]
})
</script>

<template>
  <input v-model="model" :type="type" :placeholder="placeholder" :class="inputClass" />
</template>
