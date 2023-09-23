import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import urql from '@urql/vue';
import makeClient from "./urql";

const app = createApp(App)

export const urqlClient = makeClient();

app.use(router)

app.use(urql, urqlClient);
app.mount('#app')