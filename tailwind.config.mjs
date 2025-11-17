/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brandPurple: "#7F4AD9",
        brandLavender: "#C6A2F9",
        brandLightPurple: "#DCD4FB",
        brandPink: "#D8487E",
        brandOrange: "#F27B4C",
        brandBlue: "#4E8CF2",
        brandBlack: "#1A1A1A",
        brandGray: "#D3D3D3",
        brandWhite: "#F7F7F7"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(148,116,255,0.25)",
      },
      borderRadius: {
        soft: "24px",
      },
    },
  },
  plugins: [],
};
