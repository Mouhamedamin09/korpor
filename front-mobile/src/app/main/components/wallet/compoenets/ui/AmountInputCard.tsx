import React, { FC } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Card from "@main/components/profileScreens/components/ui/card";

interface AmountInputCardProps {
  amount: string;
  onChangeAmount: (v: string) => void;
  onMaxPress: () => void;
  currencySymbol?: string;
  minAmount: number;
  feeRate?: number; // 0.005 = 0.5%
}

const AmountInputCard: FC<AmountInputCardProps> = ({
  amount,
  onChangeAmount,
  onMaxPress,
  currencySymbol = "$",
  minAmount,
  feeRate = 0.005,
}) => {
  const numeric = parseFloat(amount) || 0;
  const fee = numeric * feeRate;
  const total = numeric + fee;
  const isBelowMin = numeric > 0 && numeric < minAmount;

  return (
    <Card extraStyle="p-6 bg-white rounded-2xl shadow-xl mx-4 mb-6 min-h-[260px]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-black">Enter Amount</Text>
        <TouchableOpacity
          onPress={onMaxPress}
          className="px-4 py-1 border border-green-400 rounded-full bg-green-50"
        >
          <Text className="text-sm font-medium text-green-600">MAX</Text>
        </TouchableOpacity>
      </View>

      {/* Input Field */}
      <View
        className={`border-2 rounded-xl px-4 py-3 mb-5 ${
          isBelowMin ? "border-red-500" : "border-gray-300"
        }`}
      >
        <View className="flex-row items-center">
          <Text
            className="text-2xl font-bold text-black mr-2"
            style={{ lineHeight: 36 }}
          >
            {currencySymbol}
          </Text>
          <TextInput
            value={amount}
            onChangeText={onChangeAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-2xl font-semibold text-black"
            style={{
              paddingTop: 7,

              lineHeight: 36,
            }}
          />
        </View>
      </View>

      {/* Fee & Total Section */}
      <View className="flex-1 justify-end">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-black">Network Fee</Text>
          <Text className="text-sm font-semibold text-black">
            {currencySymbol} {fee.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-black">Total Debit</Text>
          <Text className="text-sm font-semibold text-black">
            {currencySymbol} {total.toFixed(2)}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 mt-3">
          Minimum allowed: {currencySymbol} {minAmount.toFixed(2)}
        </Text>
        {isBelowMin && (
          <Text className="text-xs text-red-600 mt-1">
            Amount must be at least {currencySymbol}
            {minAmount.toFixed(2)}
          </Text>
        )}
      </View>
    </Card>
  );
};

export default AmountInputCard;
