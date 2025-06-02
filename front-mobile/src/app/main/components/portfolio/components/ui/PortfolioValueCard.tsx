import React, { FC, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import SheetRow from "@main/components/wallet/compoenets/ui/SheetRow";
import { useRouter } from "expo-router";

interface PortfolioValueCardProps {
  usdValue?: number;
  localCurrencyCode: string;
  localValue?: number;
  loading?: boolean;
}

const { width } = Dimensions.get("window");

const PortfolioValueCard: FC<PortfolioValueCardProps> = ({
  usdValue = 0,
  localCurrencyCode,
  localValue = 0,
  loading = false,
}) => {
  const router = useRouter();
  const [investSheetOpen, setInvestSheetOpen] = useState(false);

  const usd = typeof usdValue === "number" ? usdValue : 0;
  const local = typeof localValue === "number" ? localValue : 0;

  const actions = [
    {
      icon: "refresh-ccw",
      label: "Invest",
      action: () => setInvestSheetOpen(true),
    },
    {
      icon: "plus",
      label: "Deposit",
      action: () =>
        router.push("/main/components/wallet/walletscreens/DepositScreen"),
    },
    {
      icon: "star",
      label: "Earn",
      action: () =>
        router.push(
          "/main/components/profileScreens/profile/ReferAFriendScreen"
        ),
    },
    {
      icon: "shopping-bag",
      label: "Sell",
      action: () =>
        router.push(
          "/main/components/portfolio/components/ui/ExitWindowScreen"
        ),
    },
  ];

  if (loading) {
    return (
      <Card extraStyle="p-6 bg-white rounded-2xl shadow-md mx-4 my-4">
        {/* Loading skeleton */}
        <View className="items-center">
          <View className="h-6 w-32 bg-gray-200 rounded mb-2" />
          <View className="h-10 w-48 bg-gray-200 rounded mb-2" />
          <View className="h-4 w-24 bg-gray-200 rounded" />
        </View>

        {/* Action buttons skeleton */}
        <View className="flex-row justify-between mt-6 mb-4">
          {actions.map((_, index) => (
            <View key={index} className="flex-1 items-center">
              <View className="w-14 h-14 rounded-full bg-gray-200 mb-2" />
              <View className="h-4 w-12 bg-gray-200 rounded" />
            </View>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <>
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
          {actions.map(({ icon, label, action }) => (
            <TouchableOpacity
              key={label}
              className="flex-1 items-center"
              onPress={action}
            >
              <View className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 items-center justify-center mb-2">
                <Feather name={icon as any} size={28} color={"#10B981"} />
              </View>
              <Text className="text-sm text-gray-900">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* ========== INVEST MODAL SHEET ========== */}
      <BottomSheet
        visible={investSheetOpen}
        onClose={() => setInvestSheetOpen(false)}
      >
        <SheetRow
          icon={<Feather name="home" size={24} color="#059669" />}
          title="Browse Properties"
          subtitle="Pick and choose properties yourself"
          onPress={() => {
            setInvestSheetOpen(false);
            router.push("/main/screens/properties");
          }}
        />
        <SheetRow
          icon={<Feather name="zap" size={24} color="#059669" />}
          title="AutoInvest"
          subtitle="Build a diversified portfolio on autopilot"
          onPress={() => {
            setInvestSheetOpen(false);
            router.push(
              "/main/components/wallet/walletscreens/AutoInvestScreen"
            );
          }}
        />
      </BottomSheet>
    </>
  );
};

export default PortfolioValueCard;
