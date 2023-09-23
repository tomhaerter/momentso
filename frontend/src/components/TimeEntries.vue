<template>
    <div>data: {{ data }}</div>
</template>

<script lang="ts" setup>
import NewTimeEntry from '@/components/NewTimeEntry.vue';
import TimeEntries from '@/components/TimeEntries.vue';
import { useQuery } from '@urql/vue';
import { graphql } from '@/gql';

const query = graphql(`query timeEntries { timeEntries { id } }`)

const { data } = useQuery({ query: query })
</script>