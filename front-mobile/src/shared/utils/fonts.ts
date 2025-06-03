/**
 * Font Utilities for Real Estate App
 *
 * Poppins font family provides a clean, modern, and professional look
 * perfect for real estate applications. It's highly readable and elegant.
 */

export const FontWeights = {
  thin: "100",
  extralight: "200",
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const;

export const FontFamilies = {
  // Regular fonts
  thin: "Poppins-Thin",
  extralight: "Poppins-ExtraLight",
  light: "Poppins-Light",
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semibold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
  extrabold: "Poppins-ExtraBold",
  black: "Poppins-Black",

  // Italic fonts
  thinItalic: "Poppins-ThinItalic",
  extralightItalic: "Poppins-ExtraLightItalic",
  lightItalic: "Poppins-LightItalic",
  italic: "Poppins-Italic",
  mediumItalic: "Poppins-MediumItalic",
  semiboldItalic: "Poppins-SemiBoldItalic",
  boldItalic: "Poppins-BoldItalic",
  extraboldItalic: "Poppins-ExtraBoldItalic",
  blackItalic: "Poppins-BlackItalic",

  // Special accent font
  arialRounded: "ArialRoundedBold",
} as const;

/**
 * Predefined font styles for common UI elements in real estate apps
 */
export const FontStyles = {
  // Headers and Titles
  h1: {
    fontFamily: FontFamilies.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FontFamilies.semibold,
    fontSize: 28,
    lineHeight: 36,
  },
  h3: {
    fontFamily: FontFamilies.semibold,
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: FontFamilies.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  h5: {
    fontFamily: FontFamilies.medium,
    fontSize: 18,
    lineHeight: 24,
  },
  h6: {
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    lineHeight: 22,
  },

  // Body Text
  bodyLarge: {
    fontFamily: FontFamilies.regular,
    fontSize: 18,
    lineHeight: 28,
  },
  body: {
    fontFamily: FontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
  },

  // Labels and UI Elements
  label: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily: FontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
  },

  // Buttons
  buttonLarge: {
    fontFamily: FontFamilies.semibold,
    fontSize: 18,
    lineHeight: 24,
  },
  button: {
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    lineHeight: 18,
  },

  // Real Estate Specific
  propertyTitle: {
    fontFamily: FontFamilies.semibold,
    fontSize: 22,
    lineHeight: 30,
  },
  propertyPrice: {
    fontFamily: FontFamilies.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  propertyLocation: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  propertyFeature: {
    fontFamily: FontFamilies.medium,
    fontSize: 15,
    lineHeight: 22,
  },

  // Captions and Small Text
  caption: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  captionBold: {
    fontFamily: FontFamilies.semibold,
    fontSize: 12,
    lineHeight: 16,
  },

  // Numbers and Statistics
  number: {
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  numberLarge: {
    fontFamily: FontFamilies.bold,
    fontSize: 20,
    lineHeight: 24,
  },

  // Special accent text
  accent: {
    fontFamily: FontFamilies.arialRounded,
    fontSize: 16,
    lineHeight: 20,
  },
} as const;

/**
 * Tailwind CSS classes for fonts (for use with NativeWind)
 */
export const FontClasses = {
  // Font families
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  regular: "font-regular",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",

  // Italic variants
  thinItalic: "font-thin-italic",
  extralightItalic: "font-extralight-italic",
  lightItalic: "font-light-italic",
  italic: "font-regular-italic",
  mediumItalic: "font-medium-italic",
  semiboldItalic: "font-semibold-italic",
  boldItalic: "font-bold-italic",
  extraboldItalic: "font-extrabold-italic",
  blackItalic: "font-black-italic",

  // Special fonts
  arialRounded: "font-arial-rounded",
} as const;

/**
 * Helper function to get font style object
 */
export const getFontStyle = (style: keyof typeof FontStyles) =>
  FontStyles[style];

/**
 * Helper function to get font family
 */
export const getFontFamily = (family: keyof typeof FontFamilies) =>
  FontFamilies[family];

/**
 * Helper function to create custom font style
 */
export const createFontStyle = (
  family: keyof typeof FontFamilies,
  size: number,
  lineHeight?: number
) => ({
  fontFamily: FontFamilies[family],
  fontSize: size,
  ...(lineHeight && { lineHeight }),
});
