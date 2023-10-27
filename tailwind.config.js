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
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      minWidth: {
        screen: "100vw",
      },
      minHeight: {
        screen: "100vh",
      },
      animation: {
        handdrawn: "1s ease-in-out 0s 1 normal forwards running handdrawn",
        "fade-in": "fade-in 1s ease-in-out 1",
        appear: "appear 0.6s ease-in-out 1",
        "up-down": "up-down 1s infinite",
        "cannon-right": "cannon-right 2100ms linear infinite",
        "cannon-left": "cannon-left 2100ms linear infinite",
      },
      keyframes: {
        handdrawn: {
          to: {
            strokeDashoffset: 0,
          },
        },
        "cannon-right": {
          from: {
            transform: "scale(0.95) translateX(0)",
            opacity: 0.8,
          },
          to: {
            transform: "scale(0.75) translateX(22.5%)",
            opacity: 0,
          },
        },
        "cannon-left": {
          from: {
            transform: "scale(0.95) translateX(0)",
            opacity: 0.8,
          },
          to: {
            transform: "scale(0.75) translateX(-22.5%)",
            opacity: 0,
          },
        },
        appear: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
        "fade-in": {
          "0%": {
            opacity: 0,
            transform: "translateY(4rem)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "up-down": {
          "0%, 100%": {
            transform: "translateY(-0.125rem)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0.125rem)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
    },
    data: {
      active: "active=true",
      "in-view": "in-view=true",
    },
    screens: {
      xs: { max: "575px" }, // Mobile (iPhone 3 - iPhone XS Max).
      sm: { min: "576px" }, // Mobile (matches max: iPhone 11 Pro Max landscape @ 896px).
      md: { min: "898px" }, // Tablet (matches max: iPad Pro @ 1112px).
      lg: { min: "1200px" }, // Desktop smallest.
      xl: { min: "1159px" }, // Desktop wide.
      "2xl": { min: "1359px" }, // Desktop widescreen.
    },
  },
  plugins: [],
};
