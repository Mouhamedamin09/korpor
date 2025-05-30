import React from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const data = [
  { value: 1230, label: "2025" },
  { value: 1490, label: "2026" },
  { value: 2300, label: "2027" },
  { value: 2750, label: "2028" },
  { value: 3253, label: "2029" },
];

export default function Chart() {
  return (
    <View className="p-4">
      <Text className="text-lg mb-4 font-semibold text-text">
        Overview in 5 years
      </Text>
      <BarChart
        data={data}
        barWidth={22}
        height={150}
        barBorderRadius={3}
        frontColor="#2b7fff"
        yAxisTextStyle={{ color: "#a1a1aa" }}
        xAxisLabelTextStyle={{ color: "#a1a1aa" }}
        maxValue={3500}
        noOfSections={4}
        spacing={20}
        xAxisThickness={0}
        yAxisThickness={0}
        isAnimated
        rulesColor="#e5e5e5" // << light gray horizontal lines
        rulesThickness={1} // << thin lines
        rulesType="dashed" // << solid instead of dashed (you can change to dashed)
      />
    </View>
  );
}
