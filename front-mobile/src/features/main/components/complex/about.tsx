import { View, Text, Image } from "react-native";
const Info = require("@assets/info.png");

type AboutPropertyProps = {
  description: string;
};

export default function AboutProperty({ description }: AboutPropertyProps) {
  return (
    <View>
      <Text className="text-text font-medium text-md mb-4">{description}</Text>
    </View>
  );
}
