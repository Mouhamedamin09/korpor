import { TouchableOpacity, Text } from "react-native";
import { IconButtonProps } from "@main/types/index";

export default function Plus({ onPress }: IconButtonProps) {
  return (
    <TouchableOpacity
      className="border border-zinc-300 rounded-3xl w-10 h-10 items-center"
      onPress={onPress}
    >
      <Text className="text-4xl font-normal">-</Text>
    </TouchableOpacity>
  );
}
