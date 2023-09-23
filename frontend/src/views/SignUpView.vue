<template>
  <div>
    <form class="flex flex-col" @submit.prevent="onSubmit">
      <h1 class="text-3xl mb-4">Sign up</h1>
      <input v-model="email" type="email" name="email" id="email" placeholder="Email">
      <input v-model="password" type="password" name="password" id="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMutation } from '@urql/vue';
import { graphql } from '@/gql';
import useToken from '@/composables/useUser'

const email = ref('')
const password = ref('')

const query = graphql(`mutation signUp($email: String!, $password: String!) {
  signUp(email: $email, password: $password) {
    token
    user {
      id
      email
    }
  }
}`)

const { executeMutation } = useMutation(query)

const user = useToken()

async function onSubmit() {
  const { data, error } = await executeMutation({ email: email.value, password: password.value })

  if (error) {
    console.log(error)
    return
  }

  localStorage.setItem('token', data?.signUp.token)
  console.log(data)
}
</script>
