/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#18999D",
          soft: "#E6F5F5",
          dark: "#127478",
        },
        ink: "#1C1D1F",
        muted: "#6C7075",
        line: "#E1E4E8",
        bg: "#F4F5F7",
        surface: "#FFFFFF",
        glass: {
          highlight: "rgba(255,255,255,0.75)",
          edge: "rgba(255,255,255,0.55)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "system-ui", "Inter", "ui-sans-serif", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,25,0.04), 0 1px 1px rgba(20,22,25,0.03)",
        pop: "0 20px 40px -8px rgba(20,22,25,0.16), 0 2px 8px rgba(20,22,25,0.06)",
        glass: "0 1px 1px rgba(255,255,255,0.6) inset, 0 8px 28px -6px rgba(20,22,25,0.14)",
        "glass-sm": "0 1px 1px rgba(255,255,255,0.5) inset, 0 2px 10px -2px rgba(20,22,25,0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
