import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F3EE",
        sidebar: "#FFFFFF",
        panel: {
          accent: "#C3DEDD",
        },
        accent: {
          primary: "#EF5B4B",
        },
        brand: {
          primary: "#17181C",
          secondary: "#9B9B9B",
        },
        status: {
          positive: "#3FAE71",
          warning: "#E0A020",
        },
        illustration: {
          warm: "#F5DCC0",
        },
        card: {
          bg: "#FFFFFF",
        },
      },
      fontFamily: {
        fredoka: ["Fredoka", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
