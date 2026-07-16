import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        sidebar: 'var(--bg-sidebar)',
        'panel-accent': 'var(--bg-panel-accent)',
        'accent-primary': 'var(--accent-primary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'card-bg': 'var(--card-bg)',
        'status-positive': 'var(--status-positive)',
        'status-warning': 'var(--status-warning)',
        
        // Keep existing nested mappings in case they are used
        panel: {
          accent: 'var(--bg-panel-accent)',
        },
        accent: {
          primary: 'var(--accent-primary)',
        },
        brand: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        status: {
          positive: 'var(--status-positive)',
          warning: 'var(--status-warning)',
        },
        illustration: {
          warm: "#F5DCC0",
        },
        card: {
          bg: 'var(--card-bg)',
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
