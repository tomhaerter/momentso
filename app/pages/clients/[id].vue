<script setup lang="ts">
import { ChevronLeftIcon } from "lucide-vue-next"

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: client } = await useFetch(() => `/api/clients/${id.value}`, { key: `client-${id.value}` })
const { data: entries, refresh: refreshEntries } = await useFetch(() => "/api/time-entries", { query: { clientId: id.value }, key: `client-entries-${id.value}` })

const tableEntries = computed(() => entries.value ?? [])
</script>

<template>
  <DPage>
    <DHeader>
      <DButton :icon-left="ChevronLeftIcon" variant="transparent" to="/clients" />
      <DHeaderTitle>{{ client?.name ?? "Client" }}</DHeaderTitle>
    </DHeader>

    <DPageContent>
      <TimeEntriesTable :entries="tableEntries" :show-project="true" @saved="refreshEntries" />
    </DPageContent>
  </DPage>
</template>
