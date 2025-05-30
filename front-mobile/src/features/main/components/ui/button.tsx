import { View, Text, Image, TouchableOpacity } from "react-native";
const Arrow = require("@assets/angle-left.png");
export default function Button({
  text,
  onPress,
}: {
  text: string;
  onPress: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="border border-zinc-200 flex-row items-center justify-between w-[48%] h-12 px-2 rounded-xl"
    >
      <Text className="text-text font-medium text-lg">{text}</Text>
      <Image source={Arrow} className="w-6 h-6 rotate-180" />
    </TouchableOpacity>
  );
}
