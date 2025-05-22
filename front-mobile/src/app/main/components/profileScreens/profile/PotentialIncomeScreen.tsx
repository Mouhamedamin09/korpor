// app/screens/PotentialIncomeScreen.tsx

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import {
  VictoryChart,
  VictoryArea,
  VictoryLine,
  VictoryAxis,
} from "victory-native";
import { Svg } from "react-native-svg";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";

const { width: screenWidth } = Dimensions.get("window");
// px-4 on ScrollView + p-4 on Card = 16×2 + 16×2 = 64 total horizontal padding
const chartWidth = screenWidth - 64;

const GREEN = "#34D37D";
const LIGHT_GREEN = "rgba(52,211,125,0.2)";
const yearOptions = [1, 5, 10, 15] as const;

function fmt(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}k`;
  return `${val}`;
}

export default function PotentialIncomeScreen() {
  const router = useRouter();
  const [deposit, setDeposit] = useState(6000);
  const [yearIdx, setYearIdx] = useState(yearOptions.length - 1);
  const [yieldPct, setYieldPct] = useState(6);

  const years = yearOptions[yearIdx];
  const proj = Array.from({ length: years + 1 }, (_, i) =>
    Math.round(500_000 * Math.pow(1 + yieldPct / 100, i) + deposit * 12 * i)
  );
  const rangeData = proj.map((y, i) => ({
    x: i,
    y0: Math.round(y * 0.8),
    y: Math.round(y * 1.2),
  }));
  const lineData = proj.map((y, i) => ({ x: i, y }));
  const ticks = yearOptions.filter((t) => t <= years);
  const maxY = proj[years] * 1.2;

  return (
    <View className="flex-1 bg-gray-50">
      <TopBar title="Potential income" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="px-4 pt-4"
      >
        {/* Intro */}
        <Text className="text-center text-base text-gray-700 mb-6">
          See how your monthly deposits and yield grow over time.
        </Text>

        {/* Deposit selector */}
        <Card extraStyle="mb-6">
          <Text className="text-sm text-gray-600 mb-2 text-center">
            Monthly deposit
          </Text>
          <View className="flex-row items-center justify-center border border-gray-300 rounded-xl py-2">
            <TouchableOpacity
              onPress={() => setDeposit((d) => Math.max(0, d - 100))}
              className="px-4"
            >
              <Feather name="minus" size={20} color={GREEN} />
            </TouchableOpacity>
            <View className="flex-row items-center mx-4">
              <Text className="text-gray-500 mr-1">AED</Text>
              <TextInput
                value={`${deposit}`}
                keyboardType="numeric"
                onChangeText={(t) => setDeposit(Number(t) || 0)}
                className="text-lg font-semibold text-gray-900 w-20 text-center p-0"
              />
            </View>
            <TouchableOpacity
              onPress={() => setDeposit((d) => d + 100)}
              className="px-4"
            >
              <Feather name="plus" size={20} color={GREEN} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stat cards */}
        <View className="flex-row mb-6">
          <Card extraStyle="flex-1 mr-2 p-4">
            <Feather name="bar-chart-2" size={24} color={GREEN} />
            <Text className="text-sm text-gray-500 mt-2">
              Value after {years} year{years > 1 ? "s" : ""}
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              AED {proj[years].toLocaleString()}
            </Text>
          </Card>
          <Card extraStyle="flex-1 ml-2 p-4">
            <Feather name="dollar-sign" size={24} color={GREEN} />
            <Text className="text-sm text-gray-500 mt-2">Monthly income</Text>
            <Text className="text-xl font-bold text-gray-900">
              AED{" "}
              {Math.floor(
                (proj[years] * (yieldPct / 100)) / 12
              ).toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Chart */}
        <Card extraStyle="mb-6">
          <View className="items-center">
            <Svg width={chartWidth} height={300}>
              <VictoryChart
                standalone={false}
                width={chartWidth}
                height={300}
                domain={{ x: [0, years], y: [0, maxY] }}
                padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
              >
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => fmt(t)}
                  style={{
                    axis: { stroke: "#E5E7EB" },
                    tickLabels: { fill: "#6B7280", fontSize: 10 },
                    grid: { stroke: "#E5E7EB", strokeDasharray: "4,4" },
                  }}
                />
                <VictoryAxis
                  tickValues={ticks}
                  tickFormat={(t) => `${t}Y`}
                  style={{
                    axis: { stroke: "#E5E7EB" },
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
          </View>
          <View className="mt-4 space-y-2">
            <Text className="text-sm text-gray-600">
              Green line: projection over {years} year
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
        </Card>

        {/* Controls */}
        <Card extraStyle="p-4 mb-6">
          <Text className="text-sm text-gray-600 mb-4 text-center">
            Customize timeframe & yield
          </Text>
          <View className="flex-row justify-around">
            {/* Years Picker */}
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Years</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setYearIdx((i) => Math.max(0, i - 1))}
                  className="px-2"
                >
                  <Feather name="minus" size={18} color={GREEN} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 mx-2">
                  {years}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setYearIdx((i) => Math.min(yearOptions.length - 1, i + 1))
                  }
                  className="px-2"
                >
                  <Feather name="plus" size={18} color={GREEN} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Yield Picker */}
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Net yield %</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() =>
                    setYieldPct((p) => Math.max(5.25, +(p - 0.25).toFixed(2)))
                  }
                  className="px-2"
                >
                  <Feather name="minus" size={18} color={GREEN} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 mx-2">
                  {yieldPct.toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setYieldPct((p) => Math.min(6.75, +(p + 0.25).toFixed(2)))
                  }
                  className="px-2"
                >
                  <Feather name="plus" size={18} color={GREEN} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        <Text className="text-xs text-gray-500 text-center">
          Illustrative only — adjust your inputs. Not a guarantee of future
          performance.
        </Text>
      </ScrollView>
    </View>
  );
}
