// InvestmentThemes.tsx
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";

const GREY = "#111827";
const BORDER = "#E5E7EB";

const InvestmentThemes: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Investment themes" onBackPress={() => router.back()} />
      <ScrollView
        className="flex-1 bg-white px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-2 mt-4">
          What is an Investment Theme?
        </Text>
        <Text className="text-base text-gray-500 leading-6 mb-6">
          An AutoInvest theme is a curated strategy that targets specific
          property types to align with your investment objectives
        </Text>

        <View className="flex-row items-center mb-4">
          <Feather name="book-open" size={22} color={GREY} />
          <Text className="ml-2 text-xl font-semibold text-gray-900">
            Available themes
          </Text>
        </View>

        <Card extraStyle="rounded-lg border p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Feather name="star" size={20} color="#FBBF24" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">
              Diversified theme
            </Text>
          </View>
          <Text className="text-base text-gray-500 leading-6">
            This theme offers a well-rounded approach, combining Balanced,
            Capital Growth, and High Yield properties. By spreading your
            investment across 4 properties throughout the month, it's ideal for
            investors looking to reduce risk while pursuing consistent returns.
          </Text>
        </Card>

        <Card extraStyle="rounded-lg border p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Feather name="trending-up" size={20} color="#10B981" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">
              Growth Focused theme
            </Text>
          </View>
          <Text className="text-base text-gray-500 leading-6">
            Focused on maximizing capital appreciation, the Growth Focused theme
            includes Balanced and Capital Growth properties. Your investment
            will be allocated across 3 available properties, aiming for higher
            returns with moderate risk.
          </Text>
        </Card>

        <Card extraStyle="rounded-lg border p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Feather name="activity" size={20} color="#2563EB" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">
              Income Focused theme
            </Text>
          </View>
          <Text className="text-base text-gray-500 leading-6">
            Designed for those seeking high-yield opportunities, the Income
            Focused theme combines Balanced and High Yield properties. It
            invests in 3 properties, targeting higher returns while maintaining
            diversification.
          </Text>
        </Card>

        <View className="flex-row items-center mb-4">
          <Feather name="help-circle" size={22} color={GREY} />
          <Text className="ml-2 text-xl font-semibold text-gray-900">
            Why choose a theme?
          </Text>
        </View>
        <Text className="text-base text-gray-500 leading-6">
          Choosing an investment theme simplifies your decision-making process,
          allowing you to align your portfolio with your financial goals without
          the need to select individual properties. Each theme is crafted by
          experts to optimize your returns based on your objectives.
        </Text>
      </ScrollView>
    </View>
  );
};

export default InvestmentThemes;
