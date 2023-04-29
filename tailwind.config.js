/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./common/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        platform: 
          "linear-gradient(180deg,hsla(0,0%,100%,0) 0, #fff 300px), fixed 0 0 /20px 20px radial-gradient(#d1d1d1 1px, transparent 0),fixed 10px 10px /20px 20px radial-gradient(#d1d1d1 1px, transparent 0)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      minWidth: {
        screen: "100vw",
      },
      minHeight: {
        screen: "100vh",
      },
      animation: {
        "fade-in": "fade-in 1s ease-in-out 1",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: 0,
            transform: "translateY(4rem)"
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)"
          }
        }
      }
    },
    data: {
      active: "active=true"
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
