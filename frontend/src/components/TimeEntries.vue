<template>
  <div>
    <div v-if="data" class="flex gap-4 flex-col">
      <div v-for="timeEntry in data.timeEntries.edges" :key="timeEntry.id"
        class="flex gap-2 items-center justify-between py-1 border-b pb-3">
        <div>{{ timeEntry.description }}</div>
        <div>
          {{ diffBetweenDates(timeEntry.completedAt, timeEntry.startedAt) }}
        </div>
      </div>
    </div>
    <div v-else>loading</div>
  </div>
</template>

<script lang="ts" setup>
import { useQuery } from '@urql/vue';
import { graphql } from '@/gql';
import { formatTimeAgo } from '@vueuse/core'
import type { TimeEntry } from '@/gql/graphql';

const query = graphql(`query timeEntries {
  timeEntries {
    edges {
      id
      description
      createdAt
      startedAt
      completedAt
    }
  }
}`)

const { data } = useQuery({ query: query })

function update(timeEntry: TimeEntry) {
  console.log(timeEntry)
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