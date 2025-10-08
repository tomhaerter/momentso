import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "latest",
  future: { compatibilityVersion: 4 },
  vite: { plugins: [tailwindcss()] },
  ssr: false,
  devtools: { enabled: false },
  css: ["@/app.css"],

  modules: ["nuxt-auth-utils", "@nuxt/fonts", "@vueuse/nuxt"],

  fonts: {
    experimental: { disableLocalFallbacks: true },
    providers: {}
  },

  runtimeConfig: {
    // TODO: Stripe
    // TODO: Resend
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en"
      },
      title: "Momentso"
    }
  }
})
