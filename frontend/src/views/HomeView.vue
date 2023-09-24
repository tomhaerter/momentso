<template>
  <div class="max-w-4xl mx-auto w-full">
    <div class="flex gap-4 flex-col">
      <NewTimeEntry></NewTimeEntry>

      <TimeEntries></TimeEntries>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NewTimeEntry from '@/components/NewTimeEntry.vue';
import TimeEntries from '@/components/TimeEntries.vue';
</script>