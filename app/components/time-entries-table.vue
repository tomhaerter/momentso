<script setup lang="ts">
import { Temporal } from "@js-temporal/polyfill"
import { TrashIcon, PlayIcon } from "lucide-vue-next"

interface TimeEntry {
  id: string
  description: string | null
  startTime: string | Date | null
  endTime: string | Date | null
  projectId: string | null
}

const props = withDefaults(
  defineProps<{
    entries: TimeEntry[]
    showProject?: boolean
  }>(),
  {
    showProject: true
  }
)

const emit = defineEmits<{ saved: []; resume: [entry: TimeEntry] }>()

const { formatEntryDuration, getEntryDurationSeconds, getEntryDate, formatDateLabel, formatDateInputValue, toTimeInputValue, applyDateToEntry } =
  useTimeEntryFormatters()

const { data: projectsData } = await useFetch("/api/projects")
const { data: clientsData } = await useFetch("/api/clients")

const clientById = computed(() => {
  const map = new Map<string, string>()
  for (const c of clientsData.value ?? []) {
    map.set(c.id, c.name)
  }
  return map
})

const projectById = computed(() => {
  const map = new Map<string, { name: string; color: string; clientId: string | null }>()
  for (const p of projectsData.value ?? []) {
    map.set(p.id, { name: p.name, color: p.color, clientId: p.clientId })
  }
  return map
})

const projectOptions = computed(() => (projectsData.value ?? []).map((p) => ({ value: p.id, display: p.name, color: p.color })))

// Group entries by date
const groupedEntries = computed(() => {
  const groups = new Map<string, TimeEntry[]>()
  for (const entry of props.entries) {
    const date = getEntryDate(entry)
    if (!date) continue
    if (!groups.has(date)) groups.set(date, [])
    groups.get(date)!.push(entry)
  }
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
})

function dayTotal(entries: TimeEntry[]): string {
  const total = entries.reduce((sum, e) => sum + getEntryDurationSeconds(e), 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

// Local editable state
const editValues = ref<Record<string, { start: string; end: string; date: string; description: string }>>({})

watchEffect(() => {
  for (const entry of props.entries) {
    if (!editValues.value[entry.id]) {
      editValues.value[entry.id] = {
        start: toTimeInputValue(entry.startTime),
        end: toTimeInputValue(entry.endTime),
        date: formatDateInputValue(entry.startTime),
        description: entry.description ?? ""
      }
    }
  }
})

async function saveTime(entry: TimeEntry, field: "startTime" | "endTime") {
  const edit = editValues.value[entry.id]
  if (!edit) return
  const timeValue = field === "startTime" ? edit.start : edit.end
  if (!timeValue) return
  const original = entry[field]
  if (!original) return
  const instant = typeof original === "string" ? Temporal.Instant.from(original) : Temporal.Instant.fromEpochMilliseconds(original.getTime())
  const zdt = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId())
  const [h, m, s] = timeValue.split(":").map(Number)
  const newZdt = zdt.with({ hour: h, minute: m, second: s })
  const isoValue = newZdt.toInstant().toString()
  try {
    await $fetch(`/api/time-entries/${entry.id}`, { method: "PUT", body: { [field]: isoValue } })
    entry[field] = isoValue
    emit("saved")
  } catch (error) {
    console.error("Failed to save time:", error)
  }
}

async function saveDate(entry: TimeEntry) {
  const edit = editValues.value[entry.id]
  if (!edit || !edit.date) return
  const { startTime, endTime } = applyDateToEntry(entry, edit.date)
  try {
    const body: Record<string, string> = {}
    if (startTime) body.startTime = startTime
    if (endTime) body.endTime = endTime
    await $fetch(`/api/time-entries/${entry.id}`, { method: "PUT", body })
    if (startTime) entry.startTime = startTime
    if (endTime) entry.endTime = endTime
    emit("saved")
  } catch (error) {
    console.error("Failed to save date:", error)
  }
}

async function saveDescription(entry: TimeEntry) {
  const edit = editValues.value[entry.id]
  if (!edit) return
  if (edit.description === (entry.description ?? "")) return
  try {
    await $fetch(`/api/time-entries/${entry.id}`, {
      method: "PUT",
      body: { description: edit.description }
    })
    entry.description = edit.description
    emit("saved")
  } catch (error) {
    console.error("Failed to save description:", error)
  }
}

async function saveProject(entry: TimeEntry, projectId: string | null) {
  try {
    await $fetch(`/api/time-entries/${entry.id}`, { method: "PUT", body: { projectId } })
    entry.projectId = projectId
    emit("saved")
  } catch (error) {
    console.error("Failed to save project:", error)
  }
}

async function deleteEntry(entry: TimeEntry) {
  try {
    await $fetch(`/api/time-entries/${entry.id}`, { method: "DELETE" })
    emit("saved")
  } catch (error) {
    console.error("Failed to delete time entry:", error)
  }
}

const entryToDelete = ref<TimeEntry | null>(null)
function confirmDelete(entry: TimeEntry) {
  entryToDelete.value = entry
}
async function performDelete() {
  if (!entryToDelete.value) return
  await deleteEntry(entryToDelete.value)
  entryToDelete.value = null
}
function cancelDelete() {
  entryToDelete.value = null
}

function resumeEntry(entry: TimeEntry) {
  emit("resume", entry)
}

const menuItems = [{ label: "Delete", icon: TrashIcon, danger: true }]

const inputClass =
  "tabular-nums w-28 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-neutral-700 outline-none hover:border-neutral-200 focus:border-transparent focus:ring-2 focus:ring-blue-600 h-8"
</script>

<template>
  <DPageEmpty v-if="!entries.length">No time entries yet.</DPageEmpty>

  <template v-for="[date, dayEntries] in groupedEntries" :key="date">
    <!-- Day header -->
    <div class="flex items-center justify-between border-b border-neutral-200 px-6 py-2 pt-4">
      <span class="text-sm font-medium text-neutral-900">{{ formatDateLabel(date) }}</span>
      <div class="text-sm text-neutral-500 tabular-nums">Total: {{ dayTotal(dayEntries) }}</div>
    </div>

    <!-- Entries for this day -->
    <div>
      <div v-for="entry in dayEntries" :key="entry.id" class="flex items-center gap-3 border-b border-neutral-100 px-6 py-2 hover:bg-neutral-50">
        <!-- Description (inline editable, takes remaining space) -->
        <input
          v-if="editValues[entry.id]"
          v-model="editValues[entry.id]!.description"
          type="text"
          placeholder="Add description"
          class="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-neutral-700 outline-none hover:border-neutral-200 focus:border-transparent focus:ring-2 focus:ring-blue-600"
          @blur="saveDescription(entry)"
        />

        <!-- Project dropdown -->
        <div v-if="showProject" class="w-40 shrink-0">
          <DSelect
            :model-value="entry.projectId"
            :options="projectOptions"
            placeholder="No project"
            class="w-full"
            @update:model-value="(v: string | null | undefined) => saveProject(entry, v ?? null)"
          />
        </div>

        <!-- Actions group (start, end, duration, resume, menu) -->
        <div class="flex shrink-0 items-center gap-1.5">
          <!-- Start time -->
          <input
            v-if="editValues[entry.id]"
            v-model="editValues[entry.id]!.start"
            type="time"
            step="1"
            :class="inputClass"
            @blur="saveTime(entry, 'startTime')"
          />

          <span class="text-sm text-neutral-400">-</span>

          <!-- End time -->
          <input v-if="editValues[entry.id]" v-model="editValues[entry.id]!.end" type="time" step="1" :class="inputClass" @blur="saveTime(entry, 'endTime')" />

          <!-- Duration -->
          <div class="w-28 text-center text-sm text-neutral-700 tabular-nums">
            {{ formatEntryDuration(entry) }}
          </div>

          <!-- Resume -->
          <button
            class="flex size-8 items-center justify-center rounded-md text-neutral-400 outline-none hover:bg-neutral-200 hover:text-neutral-600"
            title="Resume"
            @click="resumeEntry(entry)"
          >
            <PlayIcon class="size-4" />
          </button>

          <!-- Menu -->
          <DMenu
            :items="menuItems"
            @select="
              (i: number) => {
                if (menuItems[i]?.label === 'Delete') confirmDelete(entry)
              }
            "
          />
        </div>
      </div>
    </div>
  </template>

  <DModal v-if="entryToDelete" titel="Delete time entry" confirm-text="Delete" @close="cancelDelete" @confirm="performDelete">
    <div class="p-4">
      <p class="text-sm text-neutral-600">
        Are you sure you want to delete this time entry{{ entryToDelete.description ? ` "${entryToDelete.description}"` : "" }}? This action cannot be undone.
      </p>
    </div>
  </DModal>
</template>
