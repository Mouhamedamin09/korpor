import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { ThemeKey } from "./ThemeCard";
import { ReinvestData } from "./ReinvestSettings";

interface ConfirmAutoReinvestProps {
  percentage: number;
  theme: ThemeKey;
  settings: ReinvestData;
  onBack: () => void;
  onLaunch: () => void;
}

const themeInfo = {
  growth: {
    title: "Growth Focus",
    subtitle: "High-appreciation properties",
    icon: "trending-up",
    color: "#059669",
  },
  income: {
    title: "Income Focus",
    subtitle: "Stable rental yields",
    icon: "dollar-sign",
    color: "#DC2626",
  },
  diversified: {
    title: "Diversified",
    subtitle: "Balanced approach",
    icon: "pie-chart",
    color: "#7C3AED",
  },
};

const ConfirmAutoReinvest: React.FC<ConfirmAutoReinvestProps> = ({
  percentage,
  theme,
  settings,
  onBack,
  onLaunch,
}) => {
  const themeData = themeInfo[theme] || themeInfo.diversified;

  const formatFrequency = (freq: string) => {
    switch (freq) {
      case "immediate":
        return "Immediate";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return freq;
    }
  };

  const formatRiskLevel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Conservative";
      case "medium":
        return "Balanced";
      case "high":
        return "Aggressive";
      default:
        return risk;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check-circle" size={28} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Review Your Plan
          </Text>
          <Text className="text-gray-600 text-center">
            Confirm your AutoReinvest settings before activation
          </Text>
        </View>

        {/* Summary Card */}
        <View className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-green-600">
                {percentage}%
              </Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Auto Reinvestment Plan
            </Text>
            <Text className="text-gray-600 text-center">
              {percentage}% of rental income will be automatically reinvested
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {settings?.minimumAmount || 100}
              </Text>
              <Text className="text-sm text-gray-600">Min Amount (TND)</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {formatFrequency(settings?.frequency || "immediate")}
              </Text>
              <Text className="text-sm text-gray-600">Frequency</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {settings?.maxPerProject || 25}%
              </Text>
              <Text className="text-sm text-gray-600">Max per Project</Text>
            </View>
          </View>
        </View>

        {/* Investment Theme */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Investment Theme
          </Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-lg bg-green-50 items-center justify-center mr-3">
              <Feather
                name={themeData.icon as any}
                size={24}
                color={themeData.color}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {themeData.title}
              </Text>
              <Text className="text-sm text-gray-600">
                {themeData.subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Details */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Settings Details
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Risk Level</Text>
              <Text className="text-gray-900 font-medium">
                {formatRiskLevel(settings?.riskLevel || "medium")}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Auto Approval</Text>
              <View className="flex-row items-center">
                <Feather
                  name={settings?.autoApproval ? "check-circle" : "x-circle"}
                  size={16}
                  color={settings?.autoApproval ? "#10B981" : "#EF4444"}
                />
                <Text className="text-gray-900 font-medium ml-1">
                  {settings?.autoApproval ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <View className="flex-row items-start mb-3">
            <Feather name="info" size={20} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2">
              How AutoReinvest Works
            </Text>
          </View>
          <View className="space-y-2 ml-6">
            <View className="flex-row items-start">
              <Text className="text-blue-700 text-sm mr-2">1.</Text>
              <Text className="text-blue-700 text-sm flex-1">
                When you receive rental income, {percentage}% will be set aside
                for reinvestment
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-blue-700 text-sm mr-2">2.</Text>
              <Text className="text-blue-700 text-sm flex-1">
                Once the amount reaches {settings?.minimumAmount || 100} TND,
                we'll find suitable properties
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-blue-700 text-sm mr-2">3.</Text>
              <Text className="text-blue-700 text-sm flex-1">
                Properties will match your{" "}
                {themeData?.title?.toLowerCase() || "diversified"} theme and
                risk preferences
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-blue-700 text-sm mr-2">4.</Text>
              <Text className="text-blue-700 text-sm flex-1">
                {settings?.autoApproval
                  ? "Investments will be automatically approved"
                  : "You'll review each investment before approval"}
              </Text>
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <View className="flex-row items-start">
            <Feather name="alert-triangle" size={20} color="#D97706" />
            <View className="flex-1 ml-3">
              <Text className="text-yellow-800 font-medium mb-1">
                Important Notice
              </Text>
              <Text className="text-yellow-700 text-sm">
                You can pause, modify, or cancel your AutoReinvest plan at any
                time. Your settings will apply to future rental income, not
                existing funds.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={onLaunch}
          className="bg-black rounded-lg p-4 items-center mb-3"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">
            Activate AutoReinvest Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBack}
          className="border border-gray-300 rounded-lg p-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-gray-700 font-medium text-base">
            Back to Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConfirmAutoReinvest;
