<script lang="ts" setup>
interface Props {
  color?: string | null | undefined
  size?: "small" | "normal"
}

const { color = "blue", size = "normal" } = defineProps<Props>()

// bg-gray-100 bg-red-100 bg-orange-100 bg-amber-100 bg-yellow-100 bg-lime-100 bg-green-100 bg-emerald-100 bg-teal-100 bg-cyan-100 bg-sky-100 bg-blue-100 bg-indigo-100 bg-violet-100 bg-purple-100 bg-fuchsia-100 bg-pink-100 bg-rose-100
// hover:bg-gray-200 hover:bg-orange-200 hover:bg-amber-200 hover:bg-yellow-200 hover:bg-lime-200 hover:bg-green-200 hover:bg-emerald-200 hover:bg-teal-200 hover:bg-cyan-200 hover:bg-sky-200 hover:bg-blue-200 hover:bg-indigo-200 hover:bg-violet-200 hover:bg-purple-200 hover:bg-fuchsia-200 hover:bg-pink-200 hover:bg-rose-200
// text-gray-800 text-red-800 text-orange-800 text-amber-800 text-yellow-800 text-lime-800 text-green-800 text-emerald-800 text-teal-800 text-cyan-800 text-sky-800 text-blue-800 text-indigo-800 text-violet-800 text-purple-800 text-fuchsia-800 text-pink-800 text-rose-800
</script>

<template>
  <div
    class="flex w-fit items-center justify-between rounded-md"
    :class="[
      `bg-${color}-100 text-${color}-800`,
      size === 'normal' ? `px-2 py-0.5 text-sm` : 'px-1 py-0.5 text-xs'
      //
    ]"
  >
    <slot></slot>
  </div>
</template>
