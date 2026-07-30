<script setup lang="ts">
import { CalendarIcon } from "lucide-vue-next"

const { label = "Choose date" } = defineProps<{ label?: string }>()
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ change: [] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  const el = inputRef.value
  if (!el) return
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker()
    } catch {
      el.focus()
    }
  } else {
    el.focus()
  }
}
</script>

<template>
  <div class="relative flex shrink-0 items-center">
    <button
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-400 outline-none hover:bg-neutral-200 hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-blue-600"
      :title="model ? `${label}: ${model}` : label"
      :aria-label="label"
      @click="openPicker"
    >
      <CalendarIcon class="size-4" />
    </button>
    <input
      ref="inputRef"
      v-model="model"
      type="date"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
      @change="emit('change')"
    />
  </div>
</template>
