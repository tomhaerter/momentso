<script setup lang="ts">
import { Temporal } from "@js-temporal/polyfill"

const description = ref("")

const startTime = ref<Temporal.Instant | null>(null)
const endTime = ref<Temporal.Instant | null>(null)

const counter = useInterval(1000, {
  immediate: true
})

const time = ref("00:00:00")

const activeTimeEntryId = ref<string | null>(null)

const projects = ref<any[]>([
  {
    value: "1",
    display: "Project 1"
  },
  {
    value: "2",
    display: "Project 2"
  }
])

const projectId = ref<string | null>(null)

const { data: activeTimers } = await useFetch("/api/time-entries", {
  query: { active: "true" }
})

const { data: allEntries, refresh: refreshAllEntries } = await useFetch("/api/time-entries")

// Filter out active entries to get past entries
const pastEntries = computed(() => {
  return allEntries.value?.filter((entry) => entry.endTime != null) || []
})

// Load active timer
if (activeTimers.value && activeTimers.value.length > 0) {
  const activeTimer = activeTimers.value[0]
  if (activeTimer) {
    activeTimeEntryId.value = activeTimer.id
    description.value = activeTimer.description || ""
    projectId.value = activeTimer.projectId

    if (activeTimer.startTime) {
      startTime.value = Temporal.Instant.from(activeTimer.startTime)
    }
  }
}

watch(counter, () => {
  updateTime()
})

onMounted(() => {
  nextTick(() => {
    updateTime()
  })
})

function updateTime() {
  if (startTime.value) {
    const now = endTime.value || Temporal.Now.instant()
    const duration = now.since(startTime.value)

    const hours = Math.floor(duration.total("hours"))
    const minutes = Math.floor(duration.total("minutes")) % 60
    const seconds = Math.floor(duration.total("seconds")) % 60

    time.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
}

async function start() {
  const now = Temporal.Now.instant()
  startTime.value = now

  try {
    const data = await $fetch("/api/time-entries", {
      method: "POST",
      body: {
        description: description.value,
        startTime: now.toString(),
        projectId: projectId.value
      }
    })

    if (data) {
      activeTimeEntryId.value = data.id
    }
  } catch (error) {
    console.error("Failed to create time entry:", error)
    startTime.value = null
  }
}

async function stop() {
  if (!activeTimeEntryId.value) return

  const now = Temporal.Now.instant()
  endTime.value = now

  try {
    await $fetch(`/api/time-entries/${activeTimeEntryId.value}`, {
      method: "PUT",
      body: {
        description: description.value,
        endTime: now.toString(),
        projectId: projectId.value
      }
    })

    // Refresh the entries list
    await refreshAllEntries()

    // Reset state
    startTime.value = null
    endTime.value = null
    activeTimeEntryId.value = null
    description.value = ""
    projectId.value = null
    time.value = "00:00:00"
  } catch (error) {
    console.error("Failed to stop time entry:", error)
    endTime.value = null
  }
}

function formatEntryTime(entry: any) {
  if (!entry.startTime || !entry.endTime) return ""

  const timeZone = Temporal.Now.timeZoneId()

  // Parse ISO strings to Instant
  const startInstant =
    typeof entry.startTime === "string" ? Temporal.Instant.from(entry.startTime) : Temporal.Instant.fromEpochMilliseconds(entry.startTime.getTime())

  const endInstant = typeof entry.endTime === "string" ? Temporal.Instant.from(entry.endTime) : Temporal.Instant.fromEpochMilliseconds(entry.endTime.getTime())

  const start = startInstant.toZonedDateTimeISO(timeZone)
  const end = endInstant.toZonedDateTimeISO(timeZone)

  const startTime = `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`
  const endTime = `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}`

  return `${startTime} - ${endTime}`
}

function formatEntryDuration(entry: any) {
  if (!entry.startTime || !entry.endTime) return ""

  // Parse ISO strings to Instant
  const startInstant =
    typeof entry.startTime === "string" ? Temporal.Instant.from(entry.startTime) : Temporal.Instant.fromEpochMilliseconds(entry.startTime.getTime())

  const endInstant = typeof entry.endTime === "string" ? Temporal.Instant.from(entry.endTime) : Temporal.Instant.fromEpochMilliseconds(entry.endTime.getTime())

  const duration = endInstant.since(startInstant)

  const hours = Math.floor(duration.total("hours"))
  const minutes = Math.floor(duration.total("minutes")) % 60
  const seconds = Math.floor(duration.total("seconds")) % 60

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
</script>

<template>
  <DPage>
    <header class="px-2 pt-2.5 pb-0 sm:px-4">
      <div class="flex h-10 items-start justify-between gap-2 border-b border-neutral-200 pb-2 sm:items-center">
        <div class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
          <DInput v-model="description" class="w-full" placeholder="What are you working on?" />
          <DSelect v-model="projectId" placeholder="Select a project" :options="projects" />
          <DInput type="time" step="1" v-model="time" />
        </div>
        <div class="flex items-start justify-end gap-2 sm:items-center">
          <DButton v-if="!startTime" @click="start">Start</DButton>
          <DButton v-else @click="stop">Stop</DButton>
        </div>
      </div>
    </header>

    <div class="block min-h-0 px-4 pt-2.5">
      <div class="grid grid-cols-[2fr_1fr_1fr_1fr] items-center justify-between gap-4 border-b border-neutral-200 px-2 pb-2">
        <div class="border-r border-neutral-200 text-sm font-medium text-neutral-900">Description</div>
        <div class="border-r border-neutral-200 text-sm font-medium text-neutral-900">Time</div>
        <div class="border-r border-neutral-200 text-sm font-medium text-neutral-900">Duration</div>
        <div class="text-sm font-medium text-neutral-900">Project</div>
      </div>
    </div>

    <DPageContent>
      <div v-if="pastEntries">
        <div v-for="entry in pastEntries" :key="entry.id" class="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 rounded px-2 py-2 hover:bg-neutral-100">
          <div class="line-clamp-1 text-neutral-700">{{ entry.description ? entry.description : "N/A" }}</div>
          <div class="text-neutral-500 tabular-nums">{{ formatEntryTime(entry) }}</div>
          <div class="text-neutral-700 tabular-nums">{{ formatEntryDuration(entry) }}</div>
          <div class="text-neutral-700">{{ entry.projectId }}</div>
        </div>
      </div>
    </DPageContent>
  </DPage>
</template>
