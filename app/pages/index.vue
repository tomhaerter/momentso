<script setup lang="ts">
import { Temporal } from "@js-temporal/polyfill"

const description = ref("")

const startTime = ref<Temporal.Instant | null>(null)
const endTime = ref<Temporal.Instant | null>(null)

const counter = useInterval(1000, {
  immediate: true
})

const time = ref("00:00:00")
const activeStartTime = ref("")
const activeStartDate = ref("")

const { formatDateInputValue, toTimeInputValue, localDateTimeInputToInstant } = useTimeEntryFormatters()

const activeTimeEntryId = ref<string | null>(null)

const { data: projectsData } = await useFetch("/api/projects")

const projects = computed(() => (projectsData.value ?? []).map((p) => ({ value: p.id, display: p.name, color: p.color })))

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
      activeStartTime.value = toTimeInputValue(activeTimer.startTime)
      activeStartDate.value = formatDateInputValue(activeTimer.startTime)
    }
  }
}

watch(counter, () => {
  updateTime()
})

// Initialize immediately so a hydrated long-running timer shows its elapsed time
updateTime()

onMounted(() => {
  nextTick(() => {
    updateTime()
  })
})

function updateTime() {
  if (startTime.value) {
    const now = endTime.value || Temporal.Now.instant()
    const duration = now.since(startTime.value)

    const totalSeconds = Math.max(0, Math.floor(duration.total("seconds")))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    time.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
}

async function start() {
  const now = Temporal.Now.instant()
  startTime.value = now
  activeStartTime.value = toTimeInputValue(now)
  activeStartDate.value = formatDateInputValue(now)

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
    activeStartTime.value = ""
    activeStartDate.value = ""
  }
}

async function stop() {
  if (!activeTimeEntryId.value) return

  await saveActiveStart()

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
    activeStartTime.value = ""
    activeStartDate.value = ""
    activeTimeEntryId.value = null
    description.value = ""
    projectId.value = null
    time.value = "00:00:00"
  } catch (error) {
    console.error("Failed to stop time entry:", error)
    endTime.value = null
  }
}

let activeStartSavePromise: Promise<void> | null = null

async function saveActiveStart() {
  if (!activeTimeEntryId.value || !startTime.value) return

  const timeValue = activeStartTime.value
  const dateValue = activeStartDate.value
  const editStillMatches = () => activeStartTime.value === timeValue && activeStartDate.value === dateValue
  const resetEditValue = (value: Temporal.Instant) => {
    if (!editStillMatches()) return
    activeStartTime.value = toTimeInputValue(value)
    activeStartDate.value = formatDateInputValue(value)
  }

  if (activeStartSavePromise) await activeStartSavePromise

  const isoValue = localDateTimeInputToInstant(dateValue, timeValue)
  if (!isoValue) {
    resetEditValue(startTime.value)
    return
  }

  const nextStartTime = Temporal.Instant.from(isoValue)
  if (nextStartTime.equals(startTime.value)) {
    resetEditValue(nextStartTime)
    return
  }

  // Reject edits that would start the running timer in the future
  if (Temporal.Instant.compare(nextStartTime, Temporal.Now.instant()) > 0) {
    resetEditValue(startTime.value)
    return
  }

  const entryId = activeTimeEntryId.value
  activeStartSavePromise = (async () => {
    try {
      await $fetch(`/api/time-entries/${entryId}`, {
        method: "PUT",
        body: { startTime: isoValue }
      })
      startTime.value = nextStartTime
      resetEditValue(nextStartTime)
      updateTime()
    } catch (error) {
      console.error("Failed to save start date and time:", error)
      if (startTime.value) resetEditValue(startTime.value)
    }
  })()

  try {
    await activeStartSavePromise
  } finally {
    activeStartSavePromise = null
  }
}

async function saveDescription() {
  if (!activeTimeEntryId.value) return
  try {
    await $fetch(`/api/time-entries/${activeTimeEntryId.value}`, {
      method: "PUT",
      body: { description: description.value }
    })
  } catch (error) {
    console.error("Failed to save description:", error)
  }
}

async function resumeEntry(entry: { description: string | null; projectId: string | null }) {
  // If a timer is already running, stop it first
  if (activeTimeEntryId.value) {
    await stop()
  }
  // Pre-fill the description and project from the past entry
  description.value = entry.description ?? ""
  projectId.value = entry.projectId ?? null
  // Start a new timer with the old entry's data
  await start()
}
</script>

<template>
  <DPage>
    <header class="flex h-[55px] items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-4">
      <div class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
        <DInput v-model="description" class="w-full" placeholder="What are you working on?" @blur="saveDescription" />
        <DSelect v-model="projectId" placeholder="Select a project" :options="projects" class="w-60 shrink-0">
          <template #trigger="{ option }">
            <div class="flex items-center gap-2">
              <div v-if="option?.color" class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.color)" />
              <span class="truncate">{{ option?.display ?? "Select a project" }}</span>
            </div>
          </template>
          <template #item="{ option }">
            <div class="flex items-center gap-2">
              <div v-if="option.color" class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.color)" />
              <span class="truncate">{{ option.display }}</span>
            </div>
          </template>
        </DSelect>
        <div v-if="startTime" class="flex shrink-0 items-center gap-0.5">
          <span class="pr-1 text-xs whitespace-nowrap text-neutral-400">Started</span>
          <DDatePicker v-model="activeStartDate" label="Choose start date" @change="saveActiveStart" />
          <input
            v-model="activeStartTime"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            aria-label="Start time in 24-hour format"
            title="Start time"
            placeholder="00:00:00"
            pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?"
            class="h-8 w-24 rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-900 tabular-nums outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
            @blur="saveActiveStart"
          />
        </div>
        <output
          class="flex h-8 w-24 shrink-0 items-center rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-900 tabular-nums"
          aria-label="Elapsed time"
        >
          {{ time }}
        </output>
      </div>
      <div class="flex items-start justify-end gap-2 sm:items-center">
        <DButton v-if="!startTime" @click="start">Start</DButton>
        <DButton v-else variant="danger" @click="stop">Stop</DButton>
      </div>
    </header>

    <DPageContent>
      <TimeEntriesTable :entries="pastEntries" @saved="refreshAllEntries" @resume="resumeEntry" />
    </DPageContent>
  </DPage>
</template>
