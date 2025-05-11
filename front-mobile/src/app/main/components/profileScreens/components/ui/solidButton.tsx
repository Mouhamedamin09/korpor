import { Text, TouchableOpacity } from "react-native";

interface SolidButtonProps {
  title: string;
  onPress: () => void;
  width?: string;
  height?: string;
  paddingX?: string;
  paddingY?: string;
}

export default function SolidButton({
  title,
  onPress,
  width = "w-auto",
  height = "12",
  paddingX = "px-4",
  paddingY = "py-3",
}: SolidButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center bg-[#09090b] rounded-xl w-${width} h-${height} ${paddingX} ${paddingY}`}
      onPress={onPress}
    >
      <Text className="font-medium text-[#fafafa] text-center text-lg">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
