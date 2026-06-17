<script setup lang="ts">
import { MoreVerticalIcon } from "lucide-vue-next"
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "reka-ui"

defineProps<{
  items?: { label?: string; icon?: any; separator?: boolean; danger?: boolean }[]
}>()

const emit = defineEmits<{ select: [index: number] }>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="flex size-7 items-center justify-center rounded-md text-neutral-400 outline-none hover:bg-neutral-200 hover:text-neutral-600 data-[state=open]:bg-neutral-200 data-[state=open]:text-neutral-600"
    >
      <MoreVerticalIcon class="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side-offset="4"
        align="end"
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 z-100 min-w-[160px] rounded-md border border-neutral-200 bg-white p-1 text-sm shadow"
      >
        <template v-for="(item, i) in items" :key="i">
          <DropdownMenuSeparator v-if="item.separator" class="my-1 h-px bg-neutral-200" />
          <DropdownMenuItem
            v-else
            class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-neutral-100"
            :class="item.danger ? 'text-red-600 data-[highlighted]:bg-red-50' : 'text-neutral-700'"
            @select="emit('select', i)"
          >
            <component v-if="item.icon" :is="item.icon" class="size-4" />
            <span>{{ item.label }}</span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
