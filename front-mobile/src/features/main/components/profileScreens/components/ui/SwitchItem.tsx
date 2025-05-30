// @main/components/profileScreens/components/ui/SwitchItem.tsx
import React from "react";
import { View, Text, Switch } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface SwitchItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  iconName?: string;
  disabled?: boolean;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  value,
  onValueChange,
  description,
  iconName,
  disabled = false,
}) => {
  return (
    <View
      className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {iconName && (
            <Feather name={iconName} size={20} color="black" className="mr-4" />
          )}
          <Text className="text-base font-semibold text-black">{label}</Text>
        </View>
        <Switch
          trackColor={{ false: "#f4f4f4", true: "#10B981" }}
          thumbColor="#fff"
          ios_backgroundColor="#f4f4f4"
          onValueChange={onValueChange}
          value={value}
          disabled={disabled}
        />
      </View>
      {description && (
        <Text className="text-sm text-black mt-2">{description}</Text>
      )}
    </View>
  );
};

export default SwitchItem;
