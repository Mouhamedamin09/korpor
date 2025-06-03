/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Poppins font family - perfect for real estate apps
        sans: ["Poppins-Regular"],
        thin: ["Poppins-Thin"],
        extralight: ["Poppins-ExtraLight"],
        light: ["Poppins-Light"],
        regular: ["Poppins-Regular"],
        medium: ["Poppins-Medium"],
        semibold: ["Poppins-SemiBold"],
        bold: ["Poppins-Bold"],
        extrabold: ["Poppins-ExtraBold"],
        black: ["Poppins-Black"],

        // Italic variants
        "thin-italic": ["Poppins-ThinItalic"],
        "extralight-italic": ["Poppins-ExtraLightItalic"],
        "light-italic": ["Poppins-LightItalic"],
        "regular-italic": ["Poppins-Italic"],
        "medium-italic": ["Poppins-MediumItalic"],
        "semibold-italic": ["Poppins-SemiBoldItalic"],
        "bold-italic": ["Poppins-BoldItalic"],
        "extrabold-italic": ["Poppins-ExtraBoldItalic"],
        "black-italic": ["Poppins-BlackItalic"],

        // Special fonts for accents
        "arial-rounded": ["ArialRoundedBold"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      colors: {
        // Core surfaces
        background: "hsl(0, 0%, 100%)", // page & general bg
        surface: "hsl(0, 0%, 100%)", // cards, popovers
        surfaceText: "hsl(222.2, 84%, 4.9%)", // on-surface text
        border: "hsl(214.3, 31.8%, 91.4%)", // borders
        inputBg: "hsl(214.3, 31.8%, 91.4%)", // form inputs
        ring: "hsl(221.2, 83.2%, 53.3%)", // focus outlines

        // Primary (actions, buttons)
        primary: "#000", // primary button bg
        primaryText: "hsl(210, 40%, 98%)", // on-primary text

        // Secondary (less prominent actions)
        secondaryBg: "hsl(210, 40%, 96.1%)", // secondary button bg
        secondaryText: "hsl(222.2, 47.4%, 11.2%)", // on-secondary text

        // Muted (disabled, secondary surfaces)
        mutedBg: "hsl(210, 40%, 96.1%)",
        mutedText: "hsl(215.4, 16.3%, 46.9%)",

        // Accent (informational highlights)
        accentBg: "hsl(210, 40%, 96.1%)",
        accentText: "hsl(222.2, 47.4%, 11.2%)",

        // Destructive (delete, close)
        destructive: "hsl(0, 84.2%, 60.2%)",
        destructiveText: "hsl(210, 40%, 98%)",

        // Typography
        text: "hsl(0, 0%, 0%)", // main text
        textGray: "#71717a", // secondary text

        // Brand / special
        brandDark: "#0a0f24", // Korpor dark bg
        white: "#FFFFFF",
        black: "#000000",

        // Utility grayscale (when you need exact steps)
        "gray-50": "#F9FAFB",
        "gray-100": "#F3F4F6",
        "gray-200": "#E5E7EB",
        "gray-300": "#D1D5DB",
        "gray-400": "#9CA3AF",
        "gray-500": "#6B7280",
        "gray-600": "#4B5563",
        "gray-700": "#374151",
        "gray-800": "#1F2937",
        "gray-900": "#111827",

        // Feedback colors
        success: "#10B981", // check marks, ok
        danger: "#EF4444", // errors, critical

        // Chart palette
        chart1: "hsl(12, 76%, 61%)",
        chart2: "hsl(173, 58%, 39%)",
        chart3: "hsl(197, 37%, 24%)",
        chart4: "hsl(43, 74%, 66%)",
        chart5: "hsl(27, 87%, 67%)",
      },

      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
