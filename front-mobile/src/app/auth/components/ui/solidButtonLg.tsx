import { View } from "moti";
import { Text, TouchableOpacity } from "react-native";

interface SolidButtonProps {
  title: string;
  onPress: () => void;
  width?: string;
  height?: string;
  paddingX?: string;
  paddingY?: string;
}

export default function SolidButtonLg({
  title,
  onPress,
  width = "w-auto",
  height = "11",
  paddingX = "px-4",
  paddingY = "py-3",
}: SolidButtonProps) {
  return (
    <View>
      <TouchableOpacity
        className={`mb-3 flex-row items-center rounded-xl bg-background border-border border justify-center h-14 w-auto`}
        onPress={onPress}
      >
        <Text className="font-medium text-[#09090b] text-center text-xl">
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
