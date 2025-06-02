// components/InvestmentCalculatorCard.tsx
import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import {
  AmountSelector,
  IncomeStats,
  IncomeProjectionChart,
  DropdownMenu,
} from "@main/components/portfolio/components/ui/index";

const GREEN = "#34D37D";

type Props = {
  /** smallest amount a user can invest */
  min: number;
  /** largest amount a user can invest */
  max: number;
  /** currency for the “≈” helper text */
  currencyCode?: "USD" | "EUR" | "TND";
};

export default function Calcuator({ min, max, currencyCode = "TND" }: Props) {
  /* ────────────── state ────────────── */
  const [amount, setAmount] = useState(min);
  const [years, setYears] = useState<`${number} Years`>("5 Years");
  const [yieldPct, setYieldPct] =
    useState<`${string} Net Yield`>("6.00% Net Yield");

  /* ────────────── helpers ────────────── */
  const symbolMap: Record<"USD" | "EUR" | "TND", string> = {
    USD: "$",
    EUR: "€",
    TND: "TND",
  };
  const currencySymbol = symbolMap[currencyCode];

  const yearNumber = parseInt(years);
  const yieldNumber = parseFloat(yieldPct);

  /** simple compound-interest projection */
  const projection = useMemo(
    () =>
      Array.from({ length: yearNumber + 1 }, (_, i) =>
        Math.round(amount * Math.pow(1 + yieldNumber / 100, i))
      ),
    [amount, yearNumber, yieldNumber]
  );

  const lineData = projection.map((y, i) => ({ x: i, y }));
  const rangeData = projection.map((y, i) => ({
    x: i,
    y,
    y0: Math.round(y * 0.8), // –20 % “pessimistic”
  }));
  const maxY = projection[yearNumber] * 1.2;
  const ticks = [5, 10, 15, 20, 25].filter((t) => t <= yearNumber);

  const approxValue = Math.round(amount * 0.32).toLocaleString();

  /* ────────────── dropdown options ────────────── */
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

  /* ────────────── render ────────────── */
  return (
    <View className="mt-4 rounded-2xl overflow-visible border border-gray-200 bg-white shadow-sm p-4">
      <AmountSelector
        amount={amount}
        setAmount={(val) => setAmount(Math.max(min, Math.min(max, val)))}
        currencySymbol={currencySymbol}
        approxValue={approxValue}
      />

      <View className="mt-6">
        <IncomeStats
          years={yearNumber}
          projectedValue={projection[yearNumber]}
          monthlyIncome={Math.floor(
            (projection[yearNumber] * (yieldNumber / 100)) / 12
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

      {/* ── controls ─────────────────────────── */}
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

      {/* ℹ️ remove the old “Add to Cart” button – you said you’ll place it elsewhere */}
      <View className="h-px bg-gray-200 my-4" />

      <Text className="text-xs text-gray-500 font-semibold">
        The chart projects how your one-time investment might grow over time
        using the selected yield. The green line is the central scenario, while
        the shaded area shows a ±20 % range for market variability.
      </Text>
    </View>
  );
}
