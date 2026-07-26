import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "latest",
  future: { compatibilityVersion: 4 },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@js-temporal/polyfill", "lucide-vue-next", "reka-ui"]
    }
  },
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
    resendApiKey: process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM || "Momentso <noreply@app.momentso.com>",
    appUrl: process.env.APP_URL || "http://localhost:3000"
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
