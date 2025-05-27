import React, { FC } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";

interface PortfolioValueCardProps {
  usdValue?: number;
  localCurrencyCode: string;
  localValue?: number;
}

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = 56; // match w-14 h-14
const ACTION_W = width / 4;

const PortfolioValueCard: FC<PortfolioValueCardProps> = ({
  usdValue = 0,
  localCurrencyCode,
  localValue = 0,
}) => {
  const router = useRouter();
  const usd = typeof usdValue === "number" ? usdValue : 0;
  const local = typeof localValue === "number" ? localValue : 0;

  const actions = [
    { icon: "refresh-ccw", label: "Invest", route: "invest", filled: true },
    { icon: "plus", label: "Deposit", route: "deposit", filled: true },
    {
      icon: "star",
      label: "Earn",
      route: "main/components/wallet/walletscreens/WithdrawScreen",
      filled: false,
    },
    {
      icon: "shopping-bag",
      label: "Sell",
      route: "walletSettings",
      filled: false,
    },
  ];

  return (
    <Card extraStyle="p-6 bg-white rounded-2xl shadow-md mx-4 my-4">
      {/* Value Section */}
      <View className="items-center">
        <Text className="text-base font-medium text-gray-700 mb-2">
          Portfolio Value
        </Text>
        <Text className="text-4xl font-bold text-black">
          ${usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {localCurrencyCode}{" "}
          {local.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Action Buttons Inline in Card */}
      <View className="flex-row justify-between mt-6 mb-4">
        {actions.map(({ icon, label, route, filled }) => (
          <TouchableOpacity
            key={label}
            className="flex-1 items-center"
            onPress={() => router.push(route)}
          >
            <View className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 items-center justify-center mb-2">
              <Feather name={icon as any} size={28} color={"#0F172A"} />
            </View>
            <Text className="text-sm text-gray-900">{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

export default PortfolioValueCard;
