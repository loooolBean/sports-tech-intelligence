import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#FAFAFA",
          card: "#FFFFFF",
          elevated: "#F5F5F5",
        },
        border: {
          DEFAULT: "#E5E5E5",
          subtle: "#F0F0F0",
        },
        text: {
          primary: "#0A0A0A",
          secondary: "#525252",
          tertiary: "#A3A3A3",
        },
        accent: {
          DEFAULT: "#E11D48",
          hover: "#BE123C",
          light: "#FB7185",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display": ["4rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "h1": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "700" }],
        "h2": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h3": ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75", fontWeight: "400" }],
        "body": ["1rem", { lineHeight: "1.65", fontWeight: "400" }],
        "caption": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "500" }],
        "overline": ["0.6875rem", { lineHeight: "1.5", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      maxWidth: {
        "prose": "42rem",
        "content": "72rem",
        "wide": "80rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
