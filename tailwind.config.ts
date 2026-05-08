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
    },
  },
  plugins: [],
};

export default config;
