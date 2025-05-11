import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface Props {
  label: string;
  count: number;
  onPress: () => void;
}
const ListItemCount: React.FC<Props> = ({ label, count, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-100"
  >
    <View>
      <Text className="text-base text-black">{label}</Text>
      <Text className="text-xs text-gray-400">{count} articles</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#000" />
  </TouchableOpacity>
);

export default ListItemCount;
