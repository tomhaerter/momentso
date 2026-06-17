<script setup lang="ts">
import { ChevronLeftIcon } from "lucide-vue-next"

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: project } = await useFetch(() => `/api/projects/${id.value}`, { key: `project-${id.value}` })
const { data: entries, refresh: refreshEntries } = await useFetch(() => "/api/time-entries", { query: { projectId: id.value }, key: `project-entries-${id.value}` })

const tableEntries = computed(() => entries.value ?? [])
</script>

<template>
  <DPage>
    <DHeader>
      <DButton :icon-left="ChevronLeftIcon" variant="transparent" to="/projects" />
      <DHeaderTitle>{{ project?.name ?? "Project" }}</DHeaderTitle>
    </DHeader>

    <DPageContent>
      <TimeEntriesTable :entries="tableEntries" :show-project="false" @saved="refreshEntries" />
    </DPageContent>
  </DPage>
</template>
