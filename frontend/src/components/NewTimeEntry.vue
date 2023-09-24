<template>
  <div>
    <div
      class="flex bg-neutral-inverted/5 items-center rounded-xl p-0 overflow-hidden shadow-input-default hover:shadow-input-hover border border-transparent hover:border-neutral-inverted/10 transition duration-300 [&:has(input:focus)]:border-neutral-inverted/20">
      <input v-model="activeDescription" type="text" name="description" id="description"
        placeholder="What are you working on?"
        class="placeholder:text-neutral-inverted/50 bg-transparent h-14 pl-4 w-full focus:ring-0 p-2 text-sm border-none shadow-lg"
        autocomplete="off">

      <TimerNumber :number="Math.floor(currentSeconds / 600) % 6"></TimerNumber>
      <TimerNumber :number="Math.floor(currentSeconds / 60) % 10"></TimerNumber>
      <div class="w-3 flex justify-center">:</div>
      <TimerNumber :number="Math.floor(currentSeconds / 10) % 6"></TimerNumber>
      <TimerNumber :number="currentSeconds % 10"></TimerNumber>
      <div class="p-3">
        <button
          class="flex gap-1 items-center justify-center w-20 py-1.5 h-fit text-sm bg-accent-default hover:bg-accent-hover active:bg-gradient-to-b from-accent-dark to-accent-default transition-all text-neutral-inverted rounded-xl border border-transparent hover:border-accent-default shadow-button-default hover:shadow-button-hover active:shadow-button-pressed"
          type="button" @click="() => hasActiveTimer ? stopTracking() : startTracking()">
          <div class="flex items-center justify-center w-[18px] h-[18px]">
            <div v-show="hasActiveTimer" class="w-2.5 h-2.5 bg-neutral-inverted"></div>
            <Play v-show="!hasActiveTimer" class="fill-neutral-inverted" color="white" :size="16" />
          </div>
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transform: translate(0, -50%);
  transition: all 0.5s ease;
}

.v-enter-from {
  transform: translate(0, 40px);
}

.v-leave-to {
  transform: translate(0, -60px);
}
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useMutation, useQuery } from '@urql/vue';
import { graphql } from '@/gql';
import { Play } from 'lucide-vue-next';
import TimerNumber from './TimerNumber.vue'
import { useNow } from '@vueuse/core';

const now = useNow();

function getCurrentSeconds(startDate: string) {
  const currentDate = now.value;
  const startTime = new Date(Date.parse(startDate));
  const timeDifference = currentDate.getTime() - startTime.getTime();
  return Math.floor(timeDifference / 1000);
};

const currentSeconds = computed(() => {
  const start = runningTimeEntry.value?.runningTimeEntry?.createdAt;
  return start ? getCurrentSeconds(start) : 0;
});

const hasActiveTimer = computed(() => !!runningTimeEntry.value?.runningTimeEntry)
const buttonText = computed(() => hasActiveTimer.value ? 'Stop' : 'Start')


const description = ref('')
const activeDescription = computed({
  get: () => {
    if (hasActiveTimer.value) {
      if (!runningTimeEntry.value?.runningTimeEntry?.description) return ''
      return runningTimeEntry.value.runningTimeEntry.description
    }
    return description.value
  },
  set: (value) => {
    if (hasActiveTimer.value) {
      if (!runningTimeEntry.value?.runningTimeEntry) return
      runningTimeEntry.value.runningTimeEntry.description = value
    } else {
      description.value = value
    }
  }
})

const runningTimeEntryQuery = graphql(`query runningTimeEntry {
  runningTimeEntry {
    id
    description
    createdAt
  }
}`)

const { data: runningTimeEntry, executeQuery: refreshRunningTimer } = useQuery({ query: runningTimeEntryQuery })

const createTimeEntryQuery = graphql(`mutation createTimeEntry($description: String!) {
  createTimeEntry(input: {description: $description}) {
    timeEntry {
      id
      description
      createdAt
      startedAt
      completedAt
    }
  }
}`)

const updateTimeEntryQuery = graphql(`mutation updateTimeEntry($id: ID!, $input: UpdateTimeEntryInput!) {
  updateTimeEntry(id: $id, input: $input) {
    timeEntry {
      id
      description
      createdAt
      startedAt
      completedAt
    }
  }
}`)

const { executeMutation: createTimeEntry } = useMutation(createTimeEntryQuery)
const { executeMutation: updateTimeEntryQueryMutation } = useMutation(updateTimeEntryQuery)

async function startTracking() {
  const { data, error } = await createTimeEntry({ description: description.value })
  if (error) {
    alert(error)
    console.log(error)
    return
  }
  console.log('start tracking')


  await refreshRunningTimer()
}

async function stopTracking() {
  const id = runningTimeEntry.value?.runningTimeEntry?.id
  if (!id) return

  const { data, error } = await updateTimeEntryQueryMutation({ id: id, input: { completedAt: new Date() } })
  console.log('stop tracking')

  await refreshRunningTimer()
  description.value = ''
}
</script>
