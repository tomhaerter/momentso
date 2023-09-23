<template>
    <div>
        <form class="flex gap-2">
            <input type="text" name="description" id="description" placeholder="Description">
            <button class="py-2 px-4 border border-black" type="submit">Create</button>
        </form>
    </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { useMutation } from '@urql/vue';
import { graphql } from '@/gql';

const description = ref('')

const query = graphql(`mutation createTimeEntry($description: String!) {
  createTimeEntry(input: {description: $description}) {
    id
    description
    createdAt
    startedAt
    completedAt
  }
}`)

const { executeMutation } = useMutation(query)

async function onSubmit() {
    const { data, error } = await executeMutation({ description: description.value })

    if (error) {
        alert(error)
        console.log(error)
        return
    }

    console.log(data)
}
</script>
