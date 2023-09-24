<template>
  <div>
    <div class="flex bg-zinc-700 items-center rounded-lg p-0 overflow-hidden">
      <input v-model="activeDescription" type="text" name="description" id="description"
        placeholder="What are you working on?"
        class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 text-sm border-none">
      <div class="p-1.5">
        <button class="py-1.5 h-fit text-sm px-4 bg-red-600 hover:bg-red-500 transition-all text-white rounded-lg"
          :class="{ 'animate-pulse': hasActiveTimer }" type="button"
          @click="() => hasActiveTimer ? stopTracking() : startTracking()">{{ buttonText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useMutation, useQuery } from '@urql/vue';
import { graphql } from '@/gql';

const hasActiveTimer = computed(() => !!runningTimeEntry.value?.runningTimeEntry)
const buttonText = computed(() => hasActiveTimer.value ? 'Stop' : 'Start')

const description = ref('')
const activeDescription = computed({
  get: () => {
    if (hasActiveTimer.value) {
      return runningTimeEntryDescription.value
    }
    return description.value
  },
  set: (value) => {
    if (hasActiveTimer.value) {
      description.value = value
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

const runningTimeEntryDescription = computed(() => runningTimeEntry.value?.runningTimeEntry?.description || '')

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
