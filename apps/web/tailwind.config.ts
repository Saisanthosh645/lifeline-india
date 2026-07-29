import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5faff",
          100: "#e8f2ff",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          900: "#0c4a6e"
        },
        accent: {
          coral: "#ff6b6b",
          mint: "#32d296",
          amber: "#ffb020"
        }
      },
      boxShadow: {
        glow: "0 20px 55px -20px rgba(2,132,199,0.65)",
        card: "0 18px 60px -24px rgba(15,23,42,0.35)"
      },
      borderRadius: {
        xl2: "1.2rem",
        xl3: "1.7rem"
      },
      animation: {
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
        float: "float 5.5s ease-in-out infinite"
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.06)", opacity: "0.88" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
