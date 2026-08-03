import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0e14",
        surface: "#131722",
        border: "#232838",
        accent: "#e10600",
        gold: "#ffb800",
        silver: "#c8ccd4",
        bronze: "#cd7f32",
      },
      fontFamily: {
        display: ["var(--font-rajdhani)"],
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};

export default config;
