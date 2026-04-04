/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B4F72",
        accent: "#2E86C1",
        success: "#1E8449",
        warning: "#F39C12",
        danger: "#C0392B",
        sidebar: "#1B3A5C",
        background: "#F4F6F8",
      },
    },
  },
  plugins: [],
}
