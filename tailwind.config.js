/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        "dm-serif": ['"DM Serif Display"', "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf4",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
      },
    },
  },
  plugins: [],
};
