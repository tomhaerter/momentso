<script setup lang="ts">
import { XIcon } from "lucide-vue-next"
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from "reka-ui"

interface Props {
  titel: string
  confirmText?: string
}

withDefaults(defineProps<Props>(), {
  confirmText: "Speichern"
})

const emit = defineEmits(["close", "confirm"])

function close() {
  emit("close")
}

function save() {
  emit("confirm")
}
</script>

<template>
  <DialogRoot :default-open="true" @update:open="(v) => !v && close()">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/10"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white shadow focus:outline-none"
      >
        <div class="flex items-center justify-between rounded-t border-b border-neutral-200 px-4 py-2.5">
          <DialogTitle class="text-base font-medium text-neutral-900">{{ titel }}</DialogTitle>
          <DialogClose as-child>
            <DButton :icon-left="XIcon" variant="secondary" class="!p-1" aria-label="Close" />
          </DialogClose>
        </div>
        <div class="items-start space-y-6 overflow-auto text-left">
          <slot></slot>
        </div>
        <div class="flex justify-end space-x-2 rounded-b border-t border-neutral-200 p-4">
          <DialogClose as-child>
            <DButton variant="secondary" @click="close">Abbrechen</DButton>
          </DialogClose>
          <DButton variant="primary" @click="save">{{ confirmText }}</DButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
