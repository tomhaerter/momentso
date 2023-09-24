<template>
  <div>
    <div v-if="data" class="flex gap-px flex-col shadow-card">

      <div v-for="day in entriesByDay">
        <div>Day: {{ day[0].startedAt }}</div>
        <div v-for="timeEntry in day" :key="timeEntry.id"
          class="flex gap-2 items-center justify-between p-3 bg-neutral-inverted/5 hover:bg-neutral-inverted/10 first:rounded-t-xl last:rounded-b-xl shadow-card">
          <div class="text-sm" v-if="timeEntry.description">{{ timeEntry.description }}</div>
          <div v-else class="text-neutral-inverted/30 text-xs">(untitled)</div>
          <div class="flex items-center gap-10">
            <div class="flex gap-2 text-sm text-neutral-inverted/60">
              <div>{{ timeToHours(timeEntry.startedAt) }}</div>
              <div>–</div>
              <div>{{ timeToHours(timeEntry.completedAt) }}</div>
            </div>
            <div class="w-20">
              {{ diffBetweenDates(timeEntry.completedAt, timeEntry.startedAt) }}
            </div>
          </div>
        </div>
      </div>

    </div>
    <div v-else>loading</div>
  </div>
</template>

<script lang="ts" setup>
import { useQuery } from '@urql/vue';
import { graphql } from '@/gql';
import { computed } from 'vue';

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

const entriesByDay = computed(() => {
  if (data.value) {
    const entries = data.value.timeEntries.edges
    const entriesByDay = entries.reduce((acc: any, entry: any) => {
      const date = new Date(entry.startedAt).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry)
      return acc
    }, {})

    return entriesByDay
  }

  return []
})

const { data } = useQuery({ query: query })

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

function timeToHours(time: Date) {
  let timeObj = new Date(time);
  let afternoon = "AM";
  if (timeObj.getHours() > 12) {
    afternoon = "PM";
  }

  return `${timeObj.getHours() % 12}:${timeObj.getMinutes().toString().padStart(2, "0")} ${afternoon}`

}
</script>