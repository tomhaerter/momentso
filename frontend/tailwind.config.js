/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    backgroundColor: {
      transparent: 'transparent',
      neutral: {
        default: '#202020',
        inverted: '#FFFFFF'
      },
      accent: {
        default:'#FF3A0F',
        hover: "#FF522C",
        dark: "#A72B0F"
      },
    },
    colors: {
      transparent: 'transparent',
      accent: {
        default: "#FF3A0F",
        dark: "#A72B0F",
      },
      neutral: {
        inverted: '#FFFFFF',
      }
    },
    extend: {
      boxShadow: {
        'button-default': '0px -2px 4px 0px rgba(0, 0, 0, 0.16) inset, 0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
        'button-hover': '0px -2px 4px 0px rgba(0, 0, 0, 0.16) inset, 0px 14px 14px 0px rgba(0, 0, 0, 0.15), 0px 0px 24px 0px rgba(255, 58, 15, 0.30)',
        'button-pressed': '0px -2px 4px 0px rgba(0, 0, 0, 0.16) inset, 0px 14px 14px 0px rgba(0, 0, 0, 0.15), 0px 0px 24px 0px rgba(255, 58, 15, 0.30)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

