import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        vault: {
          black: "#0a0a0a",
          dark: "#111111",
          gray: "#1a1a1a",
          muted: "#2a2a2a",
          border: "#333333",
          text: "#e5e5e5",
          "text-muted": "#888888",
        },
        // Accent - Champagne Gold
        gold: {
          50: "#fdfbf5",
          100: "#f9f3e3",
          200: "#f2e4c3",
          300: "#e8d09a",
          400: "#ddb86e",
          500: "#d4af37", // Primary gold
          600: "#c49a2c",
          700: "#a37c24",
          800: "#856324",
          900: "#6e5221",
        },
        // Status colors
        status: {
          pending: "#f59e0b",
          progress: "#3b82f6",
          completed: "#10b981",
          cancelled: "#ef4444",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(212, 175, 55, 0.3)",
        "glow-lg": "0 0 60px rgba(212, 175, 55, 0.4)",
        card: "0 4px 20px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        shimmer: "shimmer 2s infinite",
        "count-up": "countUp 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
