<template>
  <header class="flex h-[55px] items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4">
    <div class="flex w-full items-center gap-2">
      <slot></slot>
    </div>
    <div class="flex items-center gap-2">
      <slot name="right"></slot>
    </div>
  </header>
</template>
