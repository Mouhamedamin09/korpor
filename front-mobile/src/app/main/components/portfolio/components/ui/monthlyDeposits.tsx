import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import {
  AmountSelector,
  IncomeStats,
  IncomeProjectionChart,
  DropdownMenu,
} from "./index";
import { useRouter } from "expo-router";
const GREEN = "#34D37D";
const LIGHT_GREEN = "rgba(52,211,125,0.2)";

interface Props {
  currencyCode: "USD" | "EUR" | "TND";
}

const MonthlyDepositsCard: React.FC<Props> = ({ currencyCode }) => {
  const [amount, setAmount] = useState(5000);
  const [years, setYears] = useState("10 Years");
  const [yieldPct, setYieldPct] = useState("6.00% Net Yield");
  const router = useRouter();

  const symbolMap: Record<"USD" | "EUR" | "TND", string> = {
    USD: "$",
    EUR: "€",
    TND: "TND",
  };
  const currencySymbol = symbolMap[currencyCode];

  const yearNumber = parseInt(years);
  const yieldNumber = parseFloat(yieldPct);

  const proj = Array.from({ length: yearNumber + 1 }, (_, i) =>
    Math.round(500_000 * Math.pow(1 + yieldNumber / 100, i) + amount * 12 * i)
  );
  const rangeData = proj.map((y, i) => ({
    x: i,
    y0: Math.round(y * 0.8),
    y: Math.round(y * 1.2),
  }));
  const lineData = proj.map((y, i) => ({ x: i, y }));
  const maxY = proj[yearNumber] * 1.2;
  const ticks = [5, 10, 15, 20, 25].filter((t) => t <= yearNumber);

  const approxValue = Math.round(amount * 0.32).toLocaleString();

  const yearOptions = [
    "5 Years",
    "10 Years",
    "15 Years",
    "20 Years",
    "25 Years",
  ];
  const yieldOptions = [
    "5.00% Net Yield",
    "5.25% Net Yield",
    "5.50% Net Yield",
    "5.75% Net Yield",
    "6.00% Net Yield",
    "6.25% Net Yield",
    "6.50% Net Yield",
    "6.75% Net Yield",
    "7.00% Net Yield",
  ];

  return (
    <View className="mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm p-4">
      <Text className="text-lg font-bold text-[#0A0E23] mb-4">
        Monthly Deposits
      </Text>

      <AmountSelector
        amount={amount}
        setAmount={setAmount}
        currencySymbol={currencySymbol}
        approxValue={approxValue}
      />

      <View className="mt-6">
        <IncomeStats
          years={yearNumber}
          projectedValue={proj[yearNumber]}
          monthlyIncome={Math.floor(
            (proj[yearNumber] * (yieldNumber / 100)) / 12
          )}
        />
      </View>

      <View className="mt-4">
        <IncomeProjectionChart
          lineData={lineData}
          rangeData={rangeData}
          years={yearNumber}
          maxY={maxY}
          ticks={ticks}
        />
      </View>

      <View className="flex-row justify-between mt-6 space-x-3">
        <DropdownMenu
          options={yearOptions}
          selected={years}
          onChange={setYears}
          width="48%"
        />
        <DropdownMenu
          options={yieldOptions}
          selected={yieldPct}
          onChange={setYieldPct}
          width="48%"
        />
      </View>
      <View className="h-px bg-gray-200 my-4" />
      <View className="space-y-3">
        <Text className="text-xs text-gray-500 font-semibold mb-1">
          This projection chart visualizes how your investment might grow over
          time, based on your selected monthly deposit and estimated annual
          yield. The green line shows the central estimate, while the shaded
          area represents a ±20% variability range.
        </Text>
        <Text className="text-xs text-gray-500 font-semibold">
          Use this calculator to explore how consistent monthly contributions
          can help you build long-term wealth. Adjust the investment duration
          and yield to see different outcomes and plan your financial goals with
          more confidence.
        </Text>
      </View>
      <View className="h-px bg-gray-200 my-4" />
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
        activeOpacity={0.85}
        onPress={() => {
          router.push("main/screens/properties");
        }}
      >
        <View className="flex-row items-center">
          <Feather name="home" size={18} color={GREEN} />
          <Text className="text-black font-semibold ml-2">
            View Investment Opportunities
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={"#000"} />
      </TouchableOpacity>
    </View>
  );
};

export default MonthlyDepositsCard;
