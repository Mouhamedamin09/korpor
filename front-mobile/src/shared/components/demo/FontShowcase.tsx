import React from "react";
import { ScrollView, View } from "react-native";
import {
  Text,
  Title,
  Subtitle,
  Body,
  Caption,
  Label,
  PropertyTitle,
  PropertyPrice,
  PropertyLocation,
  PropertyFeature,
} from "../typography/Text";

/**
 * Font Showcase Component
 * Demonstrates the beautiful Poppins fonts perfect for real estate applications
 */
export const FontShowcase: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Header Section */}
      <View className="mb-8">
        <Text variant="h1" color="#000">
          Korpor Real Estate
        </Text>
        <Text variant="bodyLarge" color="#6B7280" className="mt-2">
          Beautiful typography with Poppins fonts
        </Text>
      </View>

      {/* Headers Showcase */}
      <View className="mb-8">
        <Label color="#10B981">HEADERS & TITLES</Label>
        <View className="mt-4 space-y-3">
          <Text variant="h1">H1 - Find Your Dream Home</Text>
          <Text variant="h2">H2 - Luxury Properties Available</Text>
          <Text variant="h3">H3 - Featured Neighborhoods</Text>
          <Text variant="h4">H4 - Property Details</Text>
          <Text variant="h5">H5 - Agent Information</Text>
          <Text variant="h6">H6 - Additional Services</Text>
        </View>
      </View>

      {/* Real Estate Specific */}
      <View className="mb-8">
        <Label color="#10B981">REAL ESTATE ELEMENTS</Label>
        <View className="mt-4 bg-gray-50 p-4 rounded-lg">
          <PropertyTitle>Modern Villa in Sidi Bou Said</PropertyTitle>
          <PropertyLocation className="mt-1">
            Tunis, Tunisia • 2.5 km from center
          </PropertyLocation>
          <PropertyPrice className="mt-2">450,000 TND</PropertyPrice>
          <View className="mt-3 flex-row space-x-4">
            <PropertyFeature>🛏️ 4 Bedrooms</PropertyFeature>
            <PropertyFeature>🚿 3 Bathrooms</PropertyFeature>
            <PropertyFeature>📐 280 m²</PropertyFeature>
          </View>
        </View>
      </View>

      {/* Body Text Showcase */}
      <View className="mb-8">
        <Label color="#10B981">BODY TEXT</Label>
        <View className="mt-4 space-y-3">
          <Text variant="bodyLarge">
            Large body text for important descriptions and detailed property
            information.
          </Text>
          <Text variant="body">
            Regular body text perfect for property descriptions, agent profiles,
            and general content.
          </Text>
          <Text variant="bodySmall">
            Small body text for additional details, terms, and secondary
            information.
          </Text>
        </View>
      </View>

      {/* UI Elements */}
      <View className="mb-8">
        <Label color="#10B981">UI ELEMENTS</Label>
        <View className="mt-4 space-y-3">
          <View className="bg-black p-4 rounded-lg">
            <Text variant="buttonLarge" color="white">
              Schedule Viewing
            </Text>
          </View>
          <View className="bg-gray-100 p-3 rounded-lg">
            <Text variant="button" color="black">
              Contact Agent
            </Text>
          </View>
          <View className="bg-gray-200 p-2 rounded">
            <Text variant="buttonSmall" color="black">
              Save Property
            </Text>
          </View>
        </View>
      </View>

      {/* Numbers & Statistics */}
      <View className="mb-8">
        <Label color="#10B981">NUMBERS & STATS</Label>
        <View className="mt-4 bg-gray-50 p-4 rounded-lg">
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text variant="numberLarge" color="#10B981">
                1,247
              </Text>
              <Caption>Properties Listed</Caption>
            </View>
            <View className="items-center">
              <Text variant="numberLarge" color="#10B981">
                350+
              </Text>
              <Caption>Happy Clients</Caption>
            </View>
            <View className="items-center">
              <Text variant="numberLarge" color="#10B981">
                25M
              </Text>
              <Caption>Total Value (TND)</Caption>
            </View>
          </View>
        </View>
      </View>

      {/* Font Weights Showcase */}
      <View className="mb-8">
        <Label color="#10B981">FONT WEIGHTS</Label>
        <View className="mt-4 space-y-2">
          <Text family="thin" size={16}>
            Thin - Perfect for subtle elements
          </Text>
          <Text family="extralight" size={16}>
            Extra Light - Delicate information
          </Text>
          <Text family="light" size={16}>
            Light - Secondary content
          </Text>
          <Text family="regular" size={16}>
            Regular - Primary body text
          </Text>
          <Text family="medium" size={16}>
            Medium - Important labels
          </Text>
          <Text family="semibold" size={16}>
            Semi Bold - Section headers
          </Text>
          <Text family="bold" size={16}>
            Bold - Property titles
          </Text>
          <Text family="extrabold" size={16}>
            Extra Bold - Special emphasis
          </Text>
          <Text family="black" size={16}>
            Black - Maximum impact
          </Text>
        </View>
      </View>

      {/* Italic Showcase */}
      <View className="mb-8">
        <Label color="#10B981">ITALIC STYLES</Label>
        <View className="mt-4 space-y-2">
          <Text family="italic" size={16}>
            Regular Italic - Perfect for quotes and emphasis
          </Text>
          <Text family="mediumItalic" size={16}>
            Medium Italic - Styled labels and callouts
          </Text>
          <Text family="boldItalic" size={16}>
            Bold Italic - Strong emphasis with style
          </Text>
        </View>
      </View>

      {/* Special Accent Font */}
      <View className="mb-8">
        <Label color="#10B981">ACCENT FONT</Label>
        <View className="mt-4">
          <Text family="arialRounded" size={18} color="#10B981">
            KORPOR REAL ESTATE - Arial Rounded for special branding
          </Text>
        </View>
      </View>

      {/* Usage Examples */}
      <View className="mb-8">
        <Label color="#10B981">USAGE IN CONTEXT</Label>
        <View className="mt-4">
          <Title>Property Listing Example</Title>
          <Body className="mt-2">
            This beautiful villa showcases the perfect blend of modern design
            and traditional Tunisian architecture. With its spacious rooms and
            premium finishes, it offers an exceptional living experience.
          </Body>
          <Caption className="mt-3">
            Listed by Ahmed Ben Salem • Verified Agent
          </Caption>
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
};
