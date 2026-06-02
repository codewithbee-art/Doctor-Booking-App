import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        "primary-dark": "#1e3a8a",
        secondary: "#3b82f6",
        "light-blue": "#dbeafe",
        accent: "#16a34a",
        "accent-hover": "#15803d",
        "accent-success": "#22c55e",
        background: "#ffffff",
        "bg-light": "#dbeafe",
        "bg-bg-light": "#dbeafe",
        "bg-off": "#f1f5f9",
        "text-primary": "#0f172a",
        "text-secondary": "#475569",
        border: "#e2e8f0",
        warning: "#f59e0b",
        danger: "#dc2626",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-source-sans)", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(8px, -8px)" },
          "50%": { transform: "translate(0, -14px)" },
          "75%": { transform: "translate(-8px, -6px)" },
        },
        floatSpin: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(8deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        slideDown: "slideDown 0.25s ease-out",
        slideIn: "slideIn 0.25s ease-out",
        float: "float 6s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
        floatSpin: "floatSpin 9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
