import { TouchableOpacity, Text, View, Image } from "react-native";

const GoogleLogo = require("@assets/google.png");
export default function GoogleButton({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-center bg-background border border-border rounded-xl py-3 "
      onPress={onPress}
    >
      <Image
        className="w-6 h-6 mr-2"
        source={GoogleLogo}
        resizeMode="contain"
      />

      <Text className="text-text text-md font-bold">{text}</Text>
    </TouchableOpacity>
  );
}
