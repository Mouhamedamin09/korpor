// components/ui/SheetRow.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

type RowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const SheetRow: React.FC<RowProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 px-2"
  >
    {/* left icon */}
    <View className="w-10 items-center mr-3">{icon}</View>

    {/* label block */}
    <View className="flex-1">
      <Text className="text-base font-medium text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>

    {/* right chevron */}
    <Feather name="chevron-right" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default SheetRow;
