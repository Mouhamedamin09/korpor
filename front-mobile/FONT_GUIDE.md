# Poppins Font Guide for Korpor Real Estate App

## Overview

We've upgraded the Korpor Real Estate app to use the **Poppins** font family, which provides a clean, modern, and professional appearance perfect for real estate applications. Poppins is highly readable, elegant, and conveys trust and professionalism.

## Why Poppins for Real Estate?

- **Professional & Modern**: Clean, contemporary look that builds trust with clients
- **Highly Readable**: Great for displaying property details, prices, and descriptions
- **Versatile**: Works well for both headers and body text
- **Elegant**: Has a premium feel perfect for real estate marketing
- **International**: Supports multiple languages and character sets

## Font Weights Available

- **Thin (100)**: Subtle elements, watermarks
- **Extra Light (200)**: Delicate information
- **Light (300)**: Secondary content
- **Regular (400)**: Primary body text
- **Medium (500)**: Important labels, navigation
- **Semi Bold (600)**: Section headers, property titles
- **Bold (700)**: Call-to-action buttons, prices
- **Extra Bold (800)**: Special emphasis
- **Black (900)**: Maximum impact headers

## Usage Examples

### 1. Using the Text Component

```tsx
import { Text, PropertyTitle, PropertyPrice, PropertyLocation } from '@shared/components/typography/Text';

// Basic usage with variants
<Text variant="h1">Find Your Dream Home</Text>
<Text variant="body">Property description text</Text>

// Real estate specific components
<PropertyTitle>Modern Villa in Sidi Bou Said</PropertyTitle>
<PropertyPrice>450,000 TND</PropertyPrice>
<PropertyLocation>Tunis, Tunisia • 2.5 km from center</PropertyLocation>
```

### 2. Using Font Utilities

```tsx
import { FontStyles, FontFamilies, createFontStyle } from '@shared/utils/fonts';

// Direct font styles
<Text style={FontStyles.propertyTitle}>Luxury Apartment</Text>

// Custom font combinations
<Text style={createFontStyle('semibold', 20, 28)}>Custom Style</Text>
```

### 3. Using with NativeWind/Tailwind

```tsx
// Font families
<Text className="font-semibold text-xl">Property Title</Text>
<Text className="font-regular text-base">Description</Text>
<Text className="font-bold text-2xl text-green-600">Price</Text>

// Italic variants
<Text className="font-medium-italic">Emphasized text</Text>
```

## Real Estate App Typography Hierarchy

### 1. Property Listings

- **Property Title**: Semi Bold, 22px (`PropertyTitle` component)
- **Price**: Bold, 24px, Green color (`PropertyPrice` component)
- **Location**: Regular, 14px, Gray color (`PropertyLocation` component)
- **Features**: Medium, 15px (`PropertyFeature` component)

### 2. Headers & Navigation

- **Main Title**: Bold, 32px (`h1` variant)
- **Section Headers**: Semi Bold, 24px (`h3` variant)
- **Navigation Items**: Medium, 16px (`button` variant)

### 3. Content Areas

- **Body Text**: Regular, 16px (`body` variant)
- **Captions**: Regular, 12px (`caption` variant)
- **Labels**: Medium, 14px (`label` variant)

### 4. Interactive Elements

- **Primary Buttons**: Semi Bold, 18px (`buttonLarge` variant)
- **Secondary Buttons**: Semi Bold, 16px (`button` variant)
- **Links**: Medium, 16px with color accent

## Best Practices

### Do's ✅

- Use Semi Bold for property titles to make them stand out
- Use Bold for prices to emphasize value
- Use Regular for body text to maintain readability
- Use Medium for labels and navigation items
- Maintain consistent line heights for better readability
- Use color to create hierarchy (green for prices, gray for secondary info)

### Don'ts ❌

- Don't use too many different weights in one section
- Don't use Black weight for body text (too heavy)
- Don't mix Poppins with other font families unless necessary
- Don't use Thin or Extra Light for important information
- Don't forget to test on different screen sizes

## Color Combinations

### For Property Listings

- **Titles**: Black (#000000)
- **Prices**: Success Green (#10B981)
- **Locations**: Gray (#6B7280)
- **Features**: Dark Gray (#374151)

### For UI Elements

- **Primary Text**: Black (#000000)
- **Secondary Text**: Gray (#71717a)
- **Success/Positive**: Green (#10B981)
- **Error/Warning**: Red (#EF4444)

## Installation & Setup

The fonts are already configured in the app. To use them:

1. Import the Text component or font utilities
2. Use predefined variants or create custom styles
3. Apply appropriate colors for your use case

## Performance Notes

- All Poppins font weights are preloaded for optimal performance
- Font files are locally stored for offline functionality
- Fallback fonts are configured for older devices

## Examples in Context

### Property Card

```tsx
<View className="bg-white p-4 rounded-lg shadow">
  <PropertyTitle>Luxury Penthouse</PropertyTitle>
  <PropertyLocation>La Marsa, Tunis</PropertyLocation>
  <PropertyPrice>850,000 TND</PropertyPrice>
  <View className="flex-row mt-2">
    <PropertyFeature>🛏️ 3 Bedrooms</PropertyFeature>
    <PropertyFeature>🚿 2 Bathrooms</PropertyFeature>
  </View>
</View>
```

### Agent Profile

```tsx
<View>
  <Text variant="h3">Ahmed Ben Salem</Text>
  <Text variant="label" color="#6B7280">
    Senior Real Estate Agent
  </Text>
  <Text variant="body" className="mt-2">
    Specializing in luxury properties in Tunis with over 10 years of experience.
  </Text>
</View>
```

## Demo Screen

To see all fonts in action, check out the `FontShowcase` component at:
`src/shared/components/demo/FontShowcase.tsx`

This provides a comprehensive overview of all available fonts and their use cases in a real estate context.
