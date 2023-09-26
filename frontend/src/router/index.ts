import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue')
    }
  ]
})

function isAuthenticated() {
  return localStorage.getItem('token') ? true : false
}

router.beforeEach((to, from, next) => {
  switch (to.name) {
    case "login":
      if (isAuthenticated()) {
        next({ name: 'home' })
      } else {
        next()
      }
      break;
    case "signup":
      if (isAuthenticated()) {
        next({ name: 'home' })
      } else {
        next()
      }
      break;
    case "home":
      if (!isAuthenticated()) {
        next({ name: 'login' })
      } else {
        next()
      }
      break;
    default:
      next()
  }
})

export default router
