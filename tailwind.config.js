/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./common/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadein 700ms ease-in-out 0s"
      }
    },
    screens: {
      "xs": { max: "575px" }, // Mobile (iPhone 3 - iPhone XS Max).
      "sm": { min: "576px" }, // Mobile (matches max: iPhone 11 Pro Max landscape @ 896px).
      "md": { min: "898px" }, // Tablet (matches max: iPad Pro @ 1112px).
      "lg": { min: "1200px" }, // Desktop smallest.
      "xl": { min: "1159px" }, // Desktop wide.
      "2xl": { min: "1359px" } // Desktop widescreen.
    },
  },
  plugins: [],
}
