/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "secondary": "#f97316", 
        "secondary-cta": "#ff7e5f",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      }
    },
  },
  plugins: [],
}