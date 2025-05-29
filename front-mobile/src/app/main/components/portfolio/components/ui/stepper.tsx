// components/ui/AmountSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

interface Props {
  amount: number;
  setAmount: (value: number) => void;
  currencySymbol: string;
  approxValue: string;
}

const AmountSelector: React.FC<Props> = ({
  amount,
  setAmount,
  currencySymbol,
  approxValue,
}) => {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        className="h-12 w-12 rounded-xl bg-black items-center justify-center mr-3"
        onPress={() => setAmount(Math.max(0, amount - 500))}
      >
        <Feather name="minus" size={20} color="#fff" />
      </TouchableOpacity>

      <View
        className="flex-1 flex-row items-center justify-between border border-gray-200 rounded-md py-4 px-4 bg-white"
        style={{ minWidth: width * 0.45 }}
      >
        <View className="flex-row items-center">
          <Text className="text-sm font-semibold text-[#0A0E23] flex-1">
            TND
          </Text>
          <Text className="text-xl font-bold text-[#0A0E23] flex-1">
            {amount.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 ml-2">
            {`~${currencySymbol} ${approxValue}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="h-12 w-12 rounded-xl bg-black items-center justify-center ml-3"
        onPress={() => setAmount(amount + 500)}
      >
        <Feather name="plus" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default AmountSelector;
