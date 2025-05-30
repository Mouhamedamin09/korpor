import { View, Text, Image, Pressable } from "react-native";
import { TimeLine } from "@main/components/ui/index";
const Rent = require("@assets/rent.png");
const Status = require("@assets/clipboard-black.png");
const Tags = require("@assets/tags-black.png");
type TimelineProps = {
  step: number;
};
export default function TimelineComp({ step }: TimelineProps) {
  return (
    <View>
      <Text className="text-2xl font-medium text-text">
        Funding timeline estimation:
      </Text>
      <View className="mx-2">
        <TimeLine currentStep={step} />
      </View>
    </View>
  );
}
