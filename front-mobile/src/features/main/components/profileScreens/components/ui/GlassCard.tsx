import React from "react";
import { View, ViewProps } from "react-native";

/**
 * A translucent glass-style card (blur + subtle border).
 * Use in place of <View className="bg-white …"> for shadcn look.
 */
const GlassCard: React.FC<ViewProps> = ({ style, children, ...rest }) => (
  <View
    {...rest}
    style={[
      {
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 16,
        borderColor: "rgba(255,255,255,0.6)",
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default GlassCard;
