import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vox: {
          base: "#060913",
          surface: "#0b1120",
          "surface-hover": "#0f172a",
          elevated: "#131d36",
          card: "#0d1424",
          border: "rgba(56, 189, 248, 0.12)",
          "border-subtle": "rgba(255, 255, 255, 0.05)",
          "border-hover": "rgba(56, 189, 248, 0.25)",
        },
        cyan: {
          electric: "#00e5ff",
          glow: "#38bdf8",
        },
        violet: {
          intelligence: "#818cf8",
          glow: "#a78bfa",
        },
        accent: {
          blue: "#38bdf8",
          cyan: "#00e5ff",
          indigo: "#818cf8",
          violet: "#a78bfa",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#fb7185",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 229, 255, 0.12)",
        "glow-cyan": "0 0 24px rgba(0, 229, 255, 0.20)",
        "glow-violet": "0 0 24px rgba(129, 140, 248, 0.20)",
        "glow-emerald": "0 0 24px rgba(16, 185, 129, 0.20)",
        "glow-amber": "0 0 24px rgba(245, 158, 11, 0.20)",
        "glow-rose": "0 0 24px rgba(251, 113, 133, 0.25)",
        "inner-glow": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-highlight": "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
        "grid-pattern": "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse_glow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        spectrum: {
          "0%, 100%": { height: "15%" },
          "50%": { height: "85%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-glow": "pulse_glow 2.5s ease-in-out infinite",
        spectrum: "spectrum 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
