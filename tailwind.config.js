/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014", // Blue
        secondary: "#F59E0B", // Yellow
        accent: "#EF4444", // Red
        background: "#F3F4F6", // Gray
        text: "#111827", // Dark Gray
      },
    },
  },
  plugins: [],
}