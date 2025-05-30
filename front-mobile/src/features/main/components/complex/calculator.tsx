import { View, Text } from "react-native";
import { Chart } from "../ui";

export default function Calculator() {
  return (
    <View className="border border-zinc-200 self-center rounded-xl py-2 w-[100%] mt-4 px-4 mb-4">
      <View className="flex-row justify-between mt-2">
        <Text className="font-medium">Projected Investment Revenue</Text>
        <Text className="text-sm text-zinc-500 font-medium">TND</Text>
      </View>
      <View className="flex-row mt-2">
        <Text className="text-4xl font-bold">3,253.5</Text>
        <Text className="font-semibold text-sm">TND</Text>
      </View>
      <Text className="text-zinc-400 font-medium text-xs">
        +35.6% in 5 years
      </Text>
      <Chart />
    </View>
  );
}
