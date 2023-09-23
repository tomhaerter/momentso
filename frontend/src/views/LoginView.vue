<template>
  <div>
    <form class="flex flex-col" @submit.prevent="onSubmit">
      <input v-model="email" type="email" name="email" id="email" placeholder="Email">
      <input v-model="password" type="password" name="password" id="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const email = ref('')
const password = ref('')

function onSubmit() {
  console.log('submit')
}
</script>
