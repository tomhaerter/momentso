const publicRoutes = ["/login", "/logout", "/register", "/up", "/forgot-password", "/reset-password"]

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === "/logout") {
    await $fetch("/api/logout", { method: "POST" })

    const { fetch: refresh } = useUserSession()

    await refresh()
    return navigateTo("/login")
  }

  if (!publicRoutes.includes(to.path)) {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value) {
      return navigateTo("/login")
    }
  }
})
