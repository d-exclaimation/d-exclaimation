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
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      minWidth: {
        screen: '100vw',
      },
      minHeight: {
        screen: '100vh',
      },
      animation: {
        "fade-in": "fade-in 700ms ease-in-out 0s"
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: 0
          },
          "100%": {
            opacity: 1
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
