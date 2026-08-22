import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: {
          50: "#161d2d",
          100: "#121824",
          200: "#0e131d",
          300: "#0a0e16",
          DEFAULT: "#0d111a",
          card: "#0f1522",
          border: "#1e293b",
          hover: "#182235",
        },
        brand: {
          50: "#e0f7ff",
          100: "#b9edfe",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
          cyan: "#00f2fe",
          indigo: "#6366f1",
          accent: "#4f46e5",
        },
        severity: {
          critical: {
            DEFAULT: "#f43f5e",
            bg: "rgba(244, 63, 94, 0.12)",
            border: "rgba(244, 63, 94, 0.35)",
            glow: "rgba(244, 63, 94, 0.25)",
            text: "#fb7185",
          },
          high: {
            DEFAULT: "#f97316",
            bg: "rgba(249, 115, 22, 0.12)",
            border: "rgba(249, 115, 22, 0.35)",
            glow: "rgba(249, 115, 22, 0.25)",
            text: "#fb923c",
          },
          medium: {
            DEFAULT: "#eab308",
            bg: "rgba(234, 179, 8, 0.12)",
            border: "rgba(234, 179, 8, 0.35)",
            glow: "rgba(234, 179, 8, 0.25)",
            text: "#fde047",
          },
          low: {
            DEFAULT: "#38bdf8",
            bg: "rgba(56, 189, 248, 0.12)",
            border: "rgba(56, 189, 248, 0.35)",
            glow: "rgba(56, 189, 248, 0.25)",
            text: "#7dd3fc",
          },
          info: {
            DEFAULT: "#94a3b8",
            bg: "rgba(148, 163, 184, 0.12)",
            border: "rgba(148, 163, 184, 0.35)",
            glow: "rgba(148, 163, 184, 0.25)",
            text: "#cbd5e1",
          },
          safe: {
            DEFAULT: "#10b981",
            bg: "rgba(16, 185, 129, 0.12)",
            border: "rgba(16, 185, 129, 0.35)",
            glow: "rgba(16, 185, 129, 0.25)",
            text: "#34d399",
          }
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Inter",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 6s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
    },
  },
  plugins: [],
};

export default config;
