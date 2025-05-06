/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light Mode
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 84%, 4.9%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(222.2, 84%, 4.9%)",
        popover: "hsl(0, 0%, 100%)",
        "popover-foreground": "hsl(222.2, 84%, 4.9%)",
        primary: "#2b7fff",
        "primary-foreground": "hsl(210, 40%, 98%)",
        secondary: "hsl(210, 40%, 96.1%)",
        "secondary-foreground": "hsl(222.2, 47.4%, 11.2%)",
        muted: "hsl(210, 40%, 96.1%)",
        "muted-foreground": "hsl(215.4, 16.3%, 46.9%)",
        accent: "hsl(210, 40%, 96.1%)",
        "accent-foreground": "hsl(222.2, 47.4%, 11.2%)",
        destructive: "hsl(0, 84.2%, 60.2%)",
        "destructive-foreground": "hsl(210, 40%, 98%)",
        border: "hsl(214.3, 31.8%, 91.4%)",
        input: "hsl(214.3, 31.8%, 91.4%)",
        ring: "hsl(221.2, 83.2%, 53.3%)",
        text: "hsl(0, 0%, 0%)",
        textGray: "#71717a",

        // Chart colors
        "chart-1": "hsl(12, 76%, 61%)",
        "chart-2": "hsl(173, 58%, 39%)",
        "chart-3": "hsl(197, 37%, 24%)",
        "chart-4": "hsl(43, 74%, 66%)",
        "chart-5": "hsl(27, 87%, 67%)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
