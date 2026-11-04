/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1729",
        paper: "#f7f4ef",
        surface: "#ffffff",
        muted: "#5c6478",
        border: "#d8d2c8",
        accent: "#8b6914",
        "accent-light": "#c9a84c",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
