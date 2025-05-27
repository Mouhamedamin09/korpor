// @main/components/profileScreens/components/ui/TopBar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

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
  return (
    <View
      className={`bg-white border-b border-gray-200 py-4 px-4 flex-row items-center justify-between shadow-sm 
        
      }`}
    >
      <View className="flex-row items-center">
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} className="mr-3">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-900">{title}</Text>
      </View>
      {rightComponent && rightComponent}
    </View>
  );
};

export default TopBar;
