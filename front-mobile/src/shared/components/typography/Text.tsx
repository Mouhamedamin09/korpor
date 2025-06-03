import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { FontStyles, FontFamilies } from "@shared/utils/fonts";

interface TextProps extends RNTextProps {
  variant?: keyof typeof FontStyles;
  family?: keyof typeof FontFamilies;
  size?: number;
  color?: string;
  children: React.ReactNode;
}

/**
 * Enhanced Text component using Poppins fonts
 * Perfect for real estate app typography with predefined styles
 */
export const Text: React.FC<TextProps> = ({
  variant,
  family,
  size,
  color = "#000",
  style,
  children,
  ...props
}) => {
  const getTextStyle = () => {
    if (variant) {
      return FontStyles[variant];
    }

    if (family || size) {
      return {
        fontFamily: family ? FontFamilies[family] : FontFamilies.regular,
        fontSize: size || 16,
      };
    }

    return FontStyles.body;
  };

  return (
    <RNText style={[getTextStyle(), { color }, style]} {...props}>
      {children}
    </RNText>
  );
};

// Predefined components for common use cases
export const Title = ({ children, ...props }: Omit<TextProps, "variant">) => (
  <Text variant="h2" {...props}>
    {children}
  </Text>
);

export const Subtitle = ({
  children,
  ...props
}: Omit<TextProps, "variant">) => (
  <Text variant="h4" {...props}>
    {children}
  </Text>
);

export const Body = ({ children, ...props }: Omit<TextProps, "variant">) => (
  <Text variant="body" {...props}>
    {children}
  </Text>
);

export const Caption = ({ children, ...props }: Omit<TextProps, "variant">) => (
  <Text variant="caption" {...props}>
    {children}
  </Text>
);

export const Label = ({ children, ...props }: Omit<TextProps, "variant">) => (
  <Text variant="label" {...props}>
    {children}
  </Text>
);

// Real estate specific components
export const PropertyTitle = ({
  children,
  ...props
}: Omit<TextProps, "variant">) => (
  <Text variant="propertyTitle" {...props}>
    {children}
  </Text>
);

export const PropertyPrice = ({
  children,
  ...props
}: Omit<TextProps, "variant">) => (
  <Text variant="propertyPrice" color="#10B981" {...props}>
    {children}
  </Text>
);

export const PropertyLocation = ({
  children,
  ...props
}: Omit<TextProps, "variant">) => (
  <Text variant="propertyLocation" color="#6B7280" {...props}>
    {children}
  </Text>
);

export const PropertyFeature = ({
  children,
  ...props
}: Omit<TextProps, "variant">) => (
  <Text variant="propertyFeature" {...props}>
    {children}
  </Text>
);
