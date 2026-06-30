<script lang="ts" setup>
import { ChevronDownIcon, CheckIcon } from "lucide-vue-next"
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator
} from "reka-ui"

interface Option {
  value: string | number | boolean | null
  display: string
  color?: string
}

const {
  options,
  placeholder = "Bitte wählen...",
  class: triggerClass = "w-full"
} = defineProps<{
  options: Option[]
  placeholder?: string
  class?: string
}>()

const model = defineModel<string | null>()

const selectedOption = computed(() => options.find((o) => o.value === model.value))
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger
      :class="`flex min-w-0 cursor-default items-center justify-between gap-2 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-sm text-nowrap ring-blue-600 outline-none focus:ring-2 focus:outline-0 data-[placeholder]:text-neutral-700 ${triggerClass}`"
    >
      <SelectValue :placeholder="placeholder" class="min-w-0 truncate">
        <slot name="trigger" :option="selectedOption">
          {{ selectedOption?.display ?? placeholder }}
        </slot>
      </SelectValue>
      <SelectIcon as-child>
        <ChevronDownIcon class="ml-2 size-4 shrink-0 text-neutral-700" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        :side-offset="4"
        position="popper"
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 z-100 max-h-48 w-[var(--reka-select-trigger-width)] overflow-scroll rounded-md border border-neutral-200 bg-white p-1 text-sm shadow"
      >
        <SelectViewport class="flex flex-col gap-1">
          <SelectItem
            v-for="option in options"
            :key="String(option.value)"
            :value="option.value as any"
            class="flex cursor-default items-center justify-between rounded px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:outline-0 data-[highlighted]:bg-neutral-100"
          >
            <SelectItemText class="overflow-hidden text-nowrap overflow-ellipsis">
              <slot name="item" :option="option">{{ option.display }}</slot>
            </SelectItemText>
            <SelectItemIndicator as-child>
              <CheckIcon class="ml-2 size-4" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
