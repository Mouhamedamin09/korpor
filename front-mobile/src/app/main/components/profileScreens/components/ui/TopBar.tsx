import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TopBarProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  noMargin?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  onBackPress,
  rightComponent,
  noMargin = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-b border-gray-200 pb-4 px-4 flex-row justify-between shadow-sm"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row">
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} className="mr-3">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
      </View>
      {rightComponent}
    </View>
  );
};

export default TopBar;
