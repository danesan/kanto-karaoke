import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "rgb(var(--bg-main-rgb) / <alpha-value>)",
        foreground: "rgb(var(--text-main-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          foreground: "var(--secondary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "rgb(var(--text-muted-rgb) / <alpha-value>)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)"
        },
        card: {
          DEFAULT: "rgb(var(--bg-card-rgb) / <alpha-value>)",
          foreground: "rgb(var(--text-main-rgb) / <alpha-value>)"
        }
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px"
      }
    }
  },
  plugins: []
};

export default config;
