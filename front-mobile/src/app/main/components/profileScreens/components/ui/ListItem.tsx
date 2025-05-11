// @main/components/profileScreens/components/ui/ListItem.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface ListItemProps {
  iconName?: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  iconName,
  label,
  onPress,
  showChevron = true,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-2"
    >
      <View className="flex-row items-center">
        {iconName && (
          <Feather name={iconName} size={20} color="#000" className="mr-4" />
        )}
        <Text className="text-base font-medium text-gray-900">{label}</Text>
      </View>
      {showChevron && <Feather name="chevron-right" size={20} color="#000" />}
    </TouchableOpacity>
  );
};

export default ListItem;
