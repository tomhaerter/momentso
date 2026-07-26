<script setup lang="ts">
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

const { formatEntryDuration, getEntryDurationSeconds, getEntryDate, formatDateLabel, formatDateInputValue, toTimeInputValue, localDateTimeInputToInstant } =
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
const editValues = ref<Record<string, { start: string; end: string; startDate: string; endDate: string; description: string }>>({})

watchEffect(() => {
  for (const entry of props.entries) {
    if (!editValues.value[entry.id]) {
      editValues.value[entry.id] = {
        start: toTimeInputValue(entry.startTime),
        end: toTimeInputValue(entry.endTime),
        startDate: formatDateInputValue(entry.startTime),
        endDate: formatDateInputValue(entry.endTime),
        description: entry.description ?? ""
      }
    }
  }
})

const dateTimeSavePromises = new Map<string, Promise<void>>()

async function saveDateTime(entry: TimeEntry, field: "startTime" | "endTime") {
  const edit = editValues.value[entry.id]
  if (!edit) return

  const isStart = field === "startTime"
  const timeValue = isStart ? edit.start : edit.end
  const dateValue = isStart ? edit.startDate : edit.endDate
  const isoValue = localDateTimeInputToInstant(dateValue, timeValue)
  const editStillMatches = () => (isStart ? edit.start === timeValue && edit.startDate === dateValue : edit.end === timeValue && edit.endDate === dateValue)
  const resetEditValue = (value: string | Date | null) => {
    if (!editStillMatches()) return
    if (isStart) {
      edit.start = toTimeInputValue(value)
      edit.startDate = formatDateInputValue(value)
    } else {
      edit.end = toTimeInputValue(value)
      edit.endDate = formatDateInputValue(value)
    }
  }

  const key = `${entry.id}:${field}`
  const previousSave = dateTimeSavePromises.get(key)
  const savePromise = (async () => {
    if (previousSave) await previousSave

    const original = entry[field]
    if (!isoValue) {
      resetEditValue(original)
      return
    }

    if (original && toTimeInputValue(original) === toTimeInputValue(isoValue) && formatDateInputValue(original) === formatDateInputValue(isoValue)) {
      resetEditValue(original)
      return
    }

    try {
      await $fetch(`/api/time-entries/${entry.id}`, { method: "PUT", body: { [field]: isoValue } })
      entry[field] = isoValue
      resetEditValue(isoValue)
      emit("saved")
    } catch (error) {
      console.error("Failed to save date and time:", error)
      resetEditValue(original)
    }
  })()

  dateTimeSavePromises.set(key, savePromise)
  try {
    await savePromise
  } finally {
    if (dateTimeSavePromises.get(key) === savePromise) dateTimeSavePromises.delete(key)
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
          >
            <template #trigger="{ option }">
              <div class="flex items-center gap-2">
                <div v-if="option?.color" class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.color)" />
                <span class="truncate">{{ option?.display ?? "No project" }}</span>
              </div>
            </template>
            <template #item="{ option }">
              <div class="flex items-center gap-2">
                <div v-if="option.color" class="size-3 shrink-0 rounded-full" :class="colorDotClass(option.color)" />
                <span class="truncate">{{ option.display }}</span>
              </div>
            </template>
          </DSelect>
        </div>

        <!-- Actions group (start, end, duration, resume, menu) -->
        <div class="flex shrink-0 items-center gap-1.5">
          <div class="hidden items-center gap-1.5 lg:flex">
            <!-- Start time -->
            <div v-if="editValues[entry.id]" class="flex items-center gap-0.5">
              <input
                v-model="editValues[entry.id]!.start"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                aria-label="Start time in 24-hour format"
                placeholder="00:00:00"
                pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?"
                :class="inputClass"
                @blur="saveDateTime(entry, 'startTime')"
              />
              <DDatePicker v-model="editValues[entry.id]!.startDate" label="Choose start date" @change="saveDateTime(entry, 'startTime')" />
            </div>

            <span class="text-sm text-neutral-400">-</span>

            <!-- End time -->
            <div v-if="editValues[entry.id]" class="flex items-center gap-0.5">
              <input
                v-model="editValues[entry.id]!.end"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                aria-label="End time in 24-hour format"
                placeholder="00:00:00"
                pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?"
                :class="inputClass"
                @blur="saveDateTime(entry, 'endTime')"
              />
              <DDatePicker v-model="editValues[entry.id]!.endDate" label="Choose end date" @change="saveDateTime(entry, 'endTime')" />
            </div>
          </div>

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
