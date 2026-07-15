<script setup lang="ts">
import { Temporal } from "@js-temporal/polyfill"

interface OverviewPerson {
  userId: string
  name: string
  email: string | null
  totalSeconds: number
}

interface OverviewData {
  projectId: string
  start: string
  end: string
  totalSeconds: number
  people: OverviewPerson[]
}

const { formatDurationFromSeconds } = useTimeEntryFormatters()
const { data: projects } = await useFetch("/api/projects")

const projectOptions = computed(() =>
  (projects.value ?? []).map((project) => ({
    value: project.id,
    display: project.name,
    color: project.color
  }))
)
const projectId = ref<string | null>(projects.value?.[0]?.id ?? null)

const timeZone = Temporal.Now.timeZoneId()
const today = Temporal.Now.plainDateISO(timeZone)
const weekStartDate = today.subtract({ days: today.dayOfWeek - 1 })
const weekEndDate = weekStartDate.add({ days: 7 })
const weekStart = weekStartDate
  .toZonedDateTime({ timeZone, plainTime: Temporal.PlainTime.from("00:00") })
  .toInstant()
  .toString()
const weekEnd = weekEndDate
  .toZonedDateTime({ timeZone, plainTime: Temporal.PlainTime.from("00:00") })
  .toInstant()
  .toString()

const weekLabel = `${weekStartDate.toLocaleString("en-US", { month: "short", day: "numeric" })} – ${weekEndDate
  .subtract({ days: 1 })
  .toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

const overview = ref<OverviewData | null>(null)
const pending = ref(false)
const loadError = ref("")
let latestRequest = 0

async function loadOverview(selectedProjectId: string | null) {
  const request = ++latestRequest
  overview.value = null
  loadError.value = ""
  pending.value = Boolean(selectedProjectId)
  if (!selectedProjectId) return
  try {
    const data = await $fetch<OverviewData>("/api/overview", {
      query: {
        projectId: selectedProjectId,
        start: weekStart,
        end: weekEnd
      }
    })
    if (request === latestRequest) overview.value = data
  } catch (error) {
    console.error("Failed to load overview:", error)
    if (request === latestRequest) loadError.value = "Could not load this week's tracked time."
  } finally {
    if (request === latestRequest) pending.value = false
  }
}

watch(projectId, loadOverview, { immediate: true })

const peopleWhoTrackedTime = computed(() => overview.value?.people.filter((person) => person.totalSeconds > 0).length ?? 0)
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Overview</DHeaderTitle>
      <template #right>
        <DSelect v-if="projectOptions.length" v-model="projectId" :options="projectOptions" placeholder="Select a project" class="w-56">
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
      </template>
    </DHeader>

    <DPageContent>
      <DPageEmpty v-if="!projectOptions.length">
        <p>No projects yet.</p>
        <DButton to="/projects">Create a project</DButton>
      </DPageEmpty>

      <DPageEmpty v-else-if="loadError">{{ loadError }}</DPageEmpty>

      <template v-else>
        <section class="border-b border-neutral-200 px-6 py-6">
          <div class="text-sm font-medium text-neutral-500">Total time this week</div>
          <div class="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {{ pending ? "—" : formatDurationFromSeconds(overview?.totalSeconds ?? 0) }}
          </div>
          <div class="mt-1 text-sm text-neutral-500">
            {{ weekLabel }}<template v-if="overview"> · {{ peopleWhoTrackedTime }} {{ peopleWhoTrackedTime === 1 ? "person" : "people" }}</template>
          </div>
        </section>

        <DTable v-if="overview" :columns="['1fr', '9rem']">
          <template #header>
            <div class="text-sm font-medium text-neutral-900">Person</div>
            <div class="text-right text-sm font-medium text-neutral-900">Tracked time</div>
          </template>

          <div
            v-for="person in overview.people"
            :key="person.userId"
            class="grid items-center gap-4 rounded px-2 py-2 hover:bg-neutral-100"
            style="grid-template-columns: 1fr 9rem"
          >
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-neutral-900">{{ person.name }}</div>
              <div v-if="person.email" class="truncate text-xs text-neutral-500">{{ person.email }}</div>
            </div>
            <div class="text-right text-sm text-neutral-700 tabular-nums">
              {{ formatDurationFromSeconds(person.totalSeconds) }}
            </div>
          </div>
        </DTable>
      </template>
    </DPageContent>
  </DPage>
</template>
