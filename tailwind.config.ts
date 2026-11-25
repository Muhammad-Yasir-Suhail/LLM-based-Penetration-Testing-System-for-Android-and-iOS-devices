import type { Config } from "tailwindcss";

/**
 * VulnScope colour system: ONE palette, derived from the background (#0a0a0b).
 * Every colour family Tailwind offers (slate, rose, amber, emerald, sky, ...)
 * resolves to the same neutral ramp. Meaning comes from lightness, not hue:
 * critical sits brightest, high a step down, everything else quieter.
 */
const ramp: Record<number, string> = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
  950: "#09090b",
};
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** The same ramp, shifted `lighter` steps toward white (for emphasis families). */
const shade = (lighter = 0) =>
  Object.fromEntries(
    steps.map((s, i) => [s, ramp[steps[Math.max(0, i - lighter)]]])
  ) as Record<number, string>;

const neutral = shade(0);

/**
 * Signal red ramp, built from the palette (#830000 #bc0202 #ff0000 on #000000).
 * Danger / critical / high-risk families resolve here; lighter steps are
 * brightened so red text and icons stay legible on the near-black surfaces.
 */
const redRamp: Record<number, string> = {
  50: "#fff1f1",
  100: "#ffdcdc",
  200: "#ffb3b3",
  300: "#ff8080",
  400: "#ff4d4d",
  500: "#ff0000",
  600: "#d40303",
  700: "#bc0202",
  800: "#950000",
  900: "#830000",
  950: "#4a0000",
};

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
        white: ramp[50],
        black: ramp[950],

        // The one neutral ramp, under every family name the screens use.
        slate: neutral,
        gray: neutral,
        zinc: neutral,
        neutral: neutral,
        stone: neutral,
        // Danger / critical: the signal red ramp from the palette.
        rose: redRamp,
        red: redRamp,
        pink: redRamp,
        // Warning-ish families lean on the deep end of the same red (no off-palette hues).
        fuchsia: redRamp,
        amber: shade(1),
        orange: shade(1),
        yellow: shade(1),
        // Everything else: the plain ramp.
        emerald: neutral,
        green: neutral,
        teal: neutral,
        lime: neutral,
        sky: neutral,
        blue: neutral,
        cyan: neutral,
        indigo: neutral,
        violet: neutral,
        purple: neutral,

        background: "#0a0a0b",
        canvas: "#0a0a0b",
        elevated: { DEFAULT: "#111113", 2: "#18181b" },
        keycap: { DEFAULT: "#e4e4e7", ink: "#18181b" },
        signal: { DEFAULT: "#fafafa", soft: "#d4d4d8", ink: "#09090b" },
        ink: {
          DEFAULT: "#0a0a0b",
          900: "#0a0a0b",
          800: "#0f0f11",
          700: "#111113",
          600: "#18181b",
        },
        surface: {
          50: "#27272a",
          100: "#18181b",
          200: "#141416",
          300: "#111113",
          DEFAULT: "#111113",
          card: "#111113",
          border: "rgba(250,250,250,0.08)",
          hover: "#18181b",
        },
        brand: {
          50: "#fafafa",
          100: "#f4f4f5",
          400: "#d4d4d8",
          500: "#a1a1aa",
          600: "#71717a",
          cyan: "#f4f4f5",
          indigo: "#a1a1aa",
          accent: "#ff2a2a",
          red: "#ff3b3b",
        },
        // Severity as a black -> maroon -> crimson -> red heatmap from the palette.
        severity: {
          critical: { DEFAULT: "#ff0000", bg: "rgba(255,0,0,0.12)", border: "rgba(255,0,0,0.42)", glow: "rgba(255,0,0,0.28)", text: "#ff5c5c" },
          high: { DEFAULT: "#ff3b3b", bg: "rgba(188,2,2,0.16)", border: "rgba(188,2,2,0.45)", glow: "rgba(188,2,2,0.28)", text: "#ff6a6a" },
          medium: { DEFAULT: "#bc0202", bg: "rgba(131,0,0,0.20)", border: "rgba(131,0,0,0.50)", glow: "rgba(131,0,0,0.22)", text: "#ff8f8f" },
          low: { DEFAULT: "#a1a1aa", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)", glow: "rgba(161,161,170,0.08)", text: "#a1a1aa" },
          info: { DEFAULT: "#71717a", bg: "rgba(113,113,122,0.10)", border: "rgba(113,113,122,0.25)", glow: "rgba(113,113,122,0.10)", text: "#a1a1aa" },
          safe: { DEFAULT: "#a1a1aa", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)", glow: "rgba(161,161,170,0.08)", text: "#a1a1aa" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        key: "10px",
        lg: "6px",
        xl: "6px",
        "2xl": "6px",
        "3xl": "8px",
      },
      boxShadow: {
        key: "inset 0 1px 0 oklch(100% 0 0 / 0.06), 0 1px 2px oklch(8% 0.004 260 / 0.5)",
        "rc-button": "inset 0 1px 0 oklch(100% 0 0 / 0.7), 0 1px 2px oklch(8% 0.004 260 / 0.5)",
        "rc-button-hover": "inset 0 1px 0 oklch(100% 0 0 / 0.8), 0 2px 6px oklch(8% 0.004 260 / 0.5)",
        "nav-active": "inset 0 1px 0 oklch(100% 0 0 / 0.06), 0 0 0 1px oklch(100% 0 0 / 0.06)",
        drawer: "0 24px 48px -16px oklch(8% 0.004 260 / 0.85)",
        card: "0 1px 2px oklch(8% 0.004 260 / 0.5)",
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
