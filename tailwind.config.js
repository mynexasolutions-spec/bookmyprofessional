/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF8FF",
          100: "#DFF0FF",
          200: "#B9E2FF",
          300: "#7CC9FF",
          400: "#36AAFF",
          500: "#0D8EF5",
          600: "#0876D1",
          700: "#075EAA",
          800: "#084F8C",
          900: "#0B416F",
        },
        dark: {
          50: "#F4F7FA",
          100: "#E6EDF3",
          200: "#C9D5E0",
          300: "#9EADBB",
          400: "#718293",
          500: "#526477",
          600: "#3D4E60",
          700: "#293B4D",
          800: "#172B3D",
          900: "#08263A",
        },
        success: "#22B573",
        warning: "#F5A623",
        danger: "#E85D5D",

        background: "#F7FAFC",
        surface: "#FFFFFF",
        border: "#E5EAF0",
        muted: "#6B7C8F",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        hand: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(8, 38, 58, 0.08)",
        card: "0 2px 12px rgba(8, 38, 58, 0.08)",
        button: "0 4px 12px rgba(13, 142, 245, 0.20)",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
    },
  },
  plugins: [],
};
