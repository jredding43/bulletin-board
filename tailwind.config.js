/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        forest: "#228B22",
        emerald: "#50C878",
        mint: "#98FB98",
        tealGreen: "#008080",
        olive: "#6B8E23",
      },
    },
  },
  plugins: [],
};
