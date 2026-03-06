/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        parchment: "#f4efe6",
        ink: "#1f2522",
        accent: "#0b6a60",
        cream: "#fff9f0",
        line: "#d6cec0"
      },
      fontFamily: {
        display: ["Fraunces", "Noto Serif SC", "serif"],
        body: ["IBM Plex Sans", "Noto Sans SC", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 30px rgba(22, 28, 25, 0.08)"
      },
      keyframes: {
        liftIn: {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" }
        }
      },
      animation: {
        "lift-in": "liftIn 700ms ease both",
        "pulse-line": "pulseLine 2.2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
