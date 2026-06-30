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
        <DInput type="time" step="1" v-model="time" class="tabular-nums" />
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
