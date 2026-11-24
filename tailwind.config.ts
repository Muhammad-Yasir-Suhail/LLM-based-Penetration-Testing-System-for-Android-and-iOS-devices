import type { Config } from "tailwindcss";

/**
 * VulnScope design tokens — inspired by raycast.com/keyboard.
 * Neutral near-black surfaces, white/alpha text hierarchy, a single
 * "red-team" glow accent, and semantic severity colours left intact.
 */
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
        // Neutral (Raycast-style) greys replace the blue-tinted slate scale app-wide.
        slate: {
          50: "#fafafa",
          100: "#f2f2f3",
          200: "#e3e3e6",
          300: "#c4c5c9",
          400: "#9a9ba1",
          500: "#6d6e74",
          600: "#4a4b50",
          700: "#2c2d31",
          800: "#1d1e21",
          900: "#141517",
          950: "#0a0b0c",
        },
        background: "#07080a",
        ink: {
          DEFAULT: "#07080a",
          900: "#0a0b0d",
          800: "#0c0d0f",
          700: "#111214",
          600: "#17181b",
        },
        surface: {
          50: "#1a1b1e",
          100: "#151618",
          200: "#111214",
          300: "#0c0d0f",
          DEFAULT: "#0e0f11",
          card: "#0e0f11",
          border: "rgba(255,255,255,0.08)",
          hover: "#16171a",
        },
        brand: {
          50: "#fff1f1",
          100: "#ffdede",
          400: "#ff8a8a",
          500: "#ff6363",
          600: "#e5484d",
          // "cyan" / "indigo" keep their names for compatibility; they are now
          // Raycast's crisp white-to-silver accent used for active UI states.
          cyan: "#f5f5f6",
          indigo: "#a1a1aa",
          accent: "#ff6363",
          red: "#ff6363",
        },
        severity: {
          critical: { DEFAULT: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.35)", glow: "rgba(244, 63, 94, 0.25)", text: "#fb7185" },
          high: { DEFAULT: "#f97316", bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.35)", glow: "rgba(249, 115, 22, 0.25)", text: "#fb923c" },
          medium: { DEFAULT: "#eab308", bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.35)", glow: "rgba(234, 179, 8, 0.25)", text: "#fde047" },
          low: { DEFAULT: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.35)", glow: "rgba(56, 189, 248, 0.25)", text: "#7dd3fc" },
          info: { DEFAULT: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.35)", glow: "rgba(148, 163, 184, 0.25)", text: "#cbd5e1" },
          safe: { DEFAULT: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", glow: "rgba(16, 185, 129, 0.25)", text: "#34d399" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        key: "10px",
      },
      boxShadow: {
        glow: "0 0 12px 2px rgba(255, 99, 99, 0.45)",
        key: "0 0 0 1px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.06) inset, 0 -2px 0 0 rgba(0,0,0,0.5) inset, 0 6px 14px -6px rgba(0,0,0,0.8)",
        "rc-button": "0 0 0 2px rgba(0,0,0,0.5), 0 0 14px 0 rgba(255,255,255,0.19), 0 -1px 0.4px 0 rgba(0,0,0,0.2) inset, 0 1px 0.4px 0 #fff inset",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.9)",
      },
      transitionTimingFunction: {
        rc: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 6s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
