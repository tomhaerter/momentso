<template>
  <div>
    <div class="max-w-md mx-auto pt-24">
      <form class="flex text-center gap-4 flex-col" @submit.prevent="onSubmit">
        <h1 class="text-3xl mb-4">Sign up</h1>
        <input v-model="email" type="email" name="email" id="email" placeholder="Email" autocomplete="username"
          class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 rounded-lg text-sm bg-neutral-inverted/10 placeholder:text-neutral-inverted/30 border-none text-neutral-inverted/90">
        <input v-model="password" type="password" name="password" id="password" placeholder="Password"
          autocomplete="current-password"
          class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 text-sm rounded-lg bg-neutral-inverted/10 border-none placeholder:text-neutral-inverted/30 text-neutral-inverted/90">

        <input v-model="name" type="text" name="name" id="name" placeholder="Name" autocomplete="name"
          class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 rounded-lg text-sm bg-neutral-inverted/10 placeholder:text-neutral-inverted/30 border-none text-neutral-inverted/90">

        <button type="submit"
          class="bg-zinc-700 text-sm px-4 py-2 bg-neutral-inverted/10 rounded-lg h-12 text-neutral-inverted/70 hover:bg-neutral-inverted/20 transition-all">
          Sign up
        </button>

        <router-link to="/login"
          class="text-neutral-inverted/50 text-sm hover:text-neutral-inverted/60">Login</router-link>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMutation } from '@urql/vue'
import { graphql } from '@/gql'
import useToken from '@/composables/useUser'
import { useRouter } from 'vue-router';

const router = useRouter()

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
  await router.push({ name: 'home' })
}
</script>
