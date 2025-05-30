// components/ui/SecurityResourceCard.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

type Props = {
  icon: string; // Feather icon name (upper-left)
  title: string; // Two-line title at the bottom
  read?: boolean; // true → show “Read ✓”
  onPress?: () => void; // optional tap handler
};

const SecurityResourceCard: React.FC<Props> = ({
  icon,
  title,
  read = false,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="flex-1 rounded-2xl overflow-hidden" /* rounded outer shell */
  >
    <LinearGradient
      colors={["#10B981", "#065F46"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-5 flex-1" /* gradient fills, corners clipped */
    >
      {/* top row: icon + optional “Read ✓” */}
      <View className="flex-row justify-between items-start mb-8">
        <Feather name={icon as any} size={28} color="#fff" />
        {read && (
          <View className="flex-row items-center">
            <Text className="text-white font-medium mr-1">Read</Text>
            <Feather name="check" size={18} color="#fff" />
          </View>
        )}
      </View>

      {/* title */}
      <View className="flex-1 justify-end">
        <Text className="text-white text-lg font-semibold leading-6">
          {title}
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default SecurityResourceCard;
