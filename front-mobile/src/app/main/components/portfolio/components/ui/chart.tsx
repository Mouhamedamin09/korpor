// components/ui/IncomeProjectionChart.tsx
import React from "react";
import { View, Text, Dimensions } from "react-native";
import {
  VictoryChart,
  VictoryArea,
  VictoryLine,
  VictoryAxis,
} from "victory-native";
import { Svg } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 64;

const GREEN = "#34D37D";
const LIGHT_GREEN = "rgba(52,211,125,0.2)";

function fmt(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}k`;
  return `${val}`;
}

interface Props {
  lineData: { x: number; y: number }[];
  rangeData: { x: number; y: number; y0: number }[];
  years: number;
  maxY: number;
  ticks: number[];
}

const IncomeProjectionChart: React.FC<Props> = ({
  lineData,
  rangeData,
  years,
  maxY,
  ticks,
}) => {
  return (
    <View className="items-center">
      <Svg width={chartWidth} height={300}>
        <VictoryChart
          standalone={false}
          width={chartWidth}
          height={300}
          domain={{ x: [0, years], y: [0, maxY] }}
          padding={{ left: 35, right: 10, top: 0, bottom: 35 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => fmt(t)}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: { fill: "#6B7280", fontSize: 10 },
              grid: { stroke: "#E5E7EB", strokeDasharray: "4,4" },
            }}
          />
          <VictoryAxis
            tickValues={ticks}
            tickFormat={(t) => `${t}Y`}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: { fill: "#6B7280", fontSize: 10 },
              grid: { stroke: "transparent" },
            }}
          />
          <VictoryArea
            data={rangeData}
            x="x"
            y="y"
            y0="y0"
            style={{ data: { fill: LIGHT_GREEN } }}
            interpolation="monotoneX"
          />
          <VictoryLine
            data={lineData}
            x="x"
            y="y"
            style={{ data: { stroke: GREEN, strokeWidth: 3 } }}
            interpolation="monotoneX"
          />
        </VictoryChart>
      </Svg>

      <View className="mt-4 space-y-2">
        <Text className="text-sm text-gray-600">
          Green line: projection over {years} year{years > 1 ? "s" : ""}
        </Text>
        <Text className="text-sm text-gray-600">
          Shaded band: ±20% variability range
        </Text>
        <View className="flex-row justify-center mt-3">
          <View className="flex-row items-center mr-6">
            <View className="w-3 h-3 bg-green-500 mr-2 rounded-sm" />
            <Text className="text-gray-700">Projection</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-200 mr-2 rounded-sm" />
            <Text className="text-gray-700">Range</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IncomeProjectionChart;
