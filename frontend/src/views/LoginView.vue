<template>
  <div>
    <div class="max-w-md mx-auto pt-24">
      <form class="flex text-center gap-4 flex-col" @submit.prevent="onSubmit">
        <h1 class="text-3xl mb-4">Sign in</h1>
        <input v-model="email" type="email" name="email" id="email" placeholder="Email" autocomplete="username"
          class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 rounded-lg text-sm bg-neutral-inverted/10 placeholder:text-neutral-inverted/30 border-none text-neutral-inverted/90">
        <input v-model="password" type="password" name="password" id="password" placeholder="Password"
          autocomplete="current-password"
          class="placeholder:text-zinc-500 h-12 pl-4 w-full bg-zinc-700 focus:ring-0 p-2 text-sm rounded-lg bg-neutral-inverted/10 border-none placeholder:text-neutral-inverted/30 text-neutral-inverted/90">
        <button type="submit"
          class="bg-zinc-700 text-sm px-4 py-2 bg-neutral-inverted/10 rounded-lg h-12 text-neutral-inverted/70 hover:bg-neutral-inverted/20 transition-all">
          Sign in</button>
        <router-link to="/signup" class="text-neutral-inverted/50 text-sm hover:text-neutral-inverted/60">Sign
          up</router-link>

      </form>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMutation } from '@urql/vue';
import { graphql } from '@/gql';

const email = ref('')
const password = ref('')

const query = graphql(`mutation signIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    token
    user {
      id
    }
  }
}`)

const { executeMutation } = useMutation(query)

async function onSubmit() {
  const { data, error } = await executeMutation({ email: email.value, password: password.value })

  if (error) {
    alert(error)
    console.log(error)
    return
  }

  console.log(data)
  if (!data?.signIn) {
    alert('Invalid credentials')
    return
  }
  localStorage.setItem('token', data?.signIn.token)
  console.log(data)
}
</script>
