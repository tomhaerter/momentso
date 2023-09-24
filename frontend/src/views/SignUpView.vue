<template>
  <div>
    <div class="max-w-md mx-auto">
      <form class="flex text-center gap-4 flex-col" @submit.prevent="onSubmit">
        <h1 class="text-3xl mb-4">Sign up</h1>
        <input
          v-model="email"
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          autocomplete="username"
        />
        <input
          v-model="password"
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          autocomplete="new-password"
        />
        <input v-model="name" type="text" name="name" id="name" placeholder="Name" />
        <button type="submit" class="border border-black px-4 py-2">Sign up</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMutation } from '@urql/vue'
import { graphql } from '@/gql'
import useToken from '@/composables/useUser'

const name = ref('')
const email = ref('')
const password = ref('')

const query = graphql(`
  mutation signUp($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      token
      user {
        id
      }
    }
  }
`)

const { executeMutation } = useMutation(query)

const user = useToken()

async function onSubmit() {
  const { data, error } = await executeMutation({
    email: email.value,
    password: password.value,
    name: name.value
  })

  if (error || !data) {
    alert(error ?? 'missing data')
    console.log(error)
    return
  }

  localStorage.setItem('token', data?.signUp.token)
  console.log(data)
}
</script>
