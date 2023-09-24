<template>
  <div>
    <div class="flex bg-neutral-inverted/5 items-center rounded-xl p-0 overflow-hidden">
      <input v-model="activeDescription" type="text" name="description" id="description"
        placeholder="What are you working on?"
        class="placeholder:text-neutral-inverted/50 bg-transparent h-14 pl-4 w-full focus:ring-0 p-2 text-sm border-none shadow-lg" autocomplete="off">
      <div>
        {{ currentTime }}
      </div>
      <div class="p-3">
        <button class="flex gap-1 items-center justify-center w-20 py-1.5 h-fit text-sm bg-accent-default hover:bg-accent-hover active:bg-gradient-to-b from-accent-dark to-accent-default transition-all text-neutral-inverted rounded-xl border border-transparent hover:border-accent-default shadow-button-default hover:shadow-button-hover active:shadow-button-pressed"
           type="button"
          @click="() => hasActiveTimer ? stopTracking() : startTracking()">
          <div  class="flex items-center justify-center w-[18px] h-[18px]">
            <div v-show="hasActiveTimer" class="w-2.5 h-2.5 bg-neutral-inverted"></div>
            <Play v-show="!hasActiveTimer" class="fill-neutral-inverted"  color="white" :size="16"/>
          </div> 
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useMutation, useQuery } from '@urql/vue';
import { graphql } from '@/gql';
import { Play } from 'lucide-vue-next';


const hasActiveTimer = computed(() => !!runningTimeEntry.value?.runningTimeEntry)
const buttonText = computed(() => hasActiveTimer.value ? 'Stop' : 'Start')

const currentTime = computed(() => {
  if(runningTimeEntry !== undefined) {
    let start = runningTimeEntry.value?.runningTimeEntry?.createdAt;
    let now = new Date();
    return diffBetweenDates(now, start)
  }
})

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

function diffBetweenDates(date1: any, date2: any) {
  if (!date1 || !date2) return '0:0:0'

  const date1Obj = new Date(Date.parse(date1))
  const date2Obj = new Date(Date.parse(date2))

  return formatTimeDiff(date1Obj.getTime() - date2Obj.getTime())
}

function formatTimeDiff(diff: number) {
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${minutes % 60}:${seconds % 60}`
  } else {
    return `${minutes}:${seconds % 60}`
  }
}


</script>
