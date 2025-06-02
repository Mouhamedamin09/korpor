import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

export interface ReinvestData {
  minimumAmount: number;
  frequency: "immediate" | "weekly" | "monthly";
  riskLevel: "low" | "medium" | "high";
  autoApproval: boolean;
  maxPerProject: number;
  preferredRegions?: string[];
  excludedPropertyTypes?: string[];
}

interface ReinvestSettingsProps {
  settings: ReinvestData | null;
  onNext: (settings: ReinvestData) => void;
}

const frequencies = [
  {
    key: "immediate",
    label: "Immediate",
    desc: "Reinvest as soon as funds are available",
  },
  { key: "weekly", label: "Weekly", desc: "Batch reinvestments weekly" },
  { key: "monthly", label: "Monthly", desc: "Reinvest once per month" },
] as const;

const riskLevels = [
  {
    key: "low",
    label: "Conservative",
    desc: "Stable, low-risk properties",
    color: "#059669",
  },
  {
    key: "medium",
    label: "Balanced",
    desc: "Mix of safety and growth",
    color: "#D97706",
  },
  {
    key: "high",
    label: "Aggressive",
    desc: "Higher risk, higher reward",
    color: "#DC2626",
  },
] as const;

const regions = ["Tunis", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte"];
const propertyTypes = [
  "Apartment",
  "Villa",
  "Commercial",
  "Land",
  "Tourist Property",
];

const ReinvestSettings: React.FC<ReinvestSettingsProps> = ({
  settings,
  onNext,
}) => {
  const [minimumAmount, setMinimumAmount] = useState(
    settings?.minimumAmount || 100
  );
  const [frequency, setFrequency] = useState<
    "immediate" | "weekly" | "monthly"
  >(settings?.frequency || "immediate");
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    settings?.riskLevel || "medium"
  );
  const [autoApproval, setAutoApproval] = useState<boolean>(
    settings?.autoApproval || true
  );
  const [maxPerProject, setMaxPerProject] = useState(
    settings?.maxPerProject || 25
  );

  const handleNext = () => {
    const settingsData: ReinvestData = {
      minimumAmount,
      frequency,
      riskLevel,
      autoApproval,
      maxPerProject,
    };
    onNext(settingsData);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4 py-4 mb-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="settings" size={28} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Reinvestment Settings
          </Text>
          <Text className="text-gray-600 text-center">
            Configure how your rental income will be reinvested
          </Text>
        </View>

        {/* Minimum Amount */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Minimum Reinvestment Amount
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Only reinvest when accumulated amount reaches this threshold
          </Text>
          <View className="flex-row items-center">
            <TextInput
              value={minimumAmount.toString()}
              onChangeText={(text) => setMinimumAmount(parseInt(text) || 100)}
              className="flex-1 h-12 px-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-medium mr-2"
              placeholder="100"
              keyboardType="numeric"
            />
            <Text className="text-lg font-medium text-gray-600">TND</Text>
          </View>
        </View>

        {/* Frequency */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Reinvestment Frequency
          </Text>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.key}
              onPress={() => setFrequency(freq.key)}
              className={`flex-row items-center p-3 rounded-lg mb-2 ${
                frequency === freq.key
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50"
              } border`}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  frequency === freq.key
                    ? "border-green-500"
                    : "border-gray-400"
                }`}
              >
                {frequency === freq.key && (
                  <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{freq.label}</Text>
                <Text className="text-sm text-gray-600">{freq.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Risk Level */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Risk Level
          </Text>
          {riskLevels.map((risk) => (
            <TouchableOpacity
              key={risk.key}
              onPress={() => setRiskLevel(risk.key)}
              className={`flex-row items-center p-3 rounded-lg mb-2 ${
                riskLevel === risk.key
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50"
              } border`}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  riskLevel === risk.key
                    ? "border-green-500"
                    : "border-gray-400"
                }`}
              >
                {riskLevel === risk.key && (
                  <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{risk.label}</Text>
                <Text className="text-sm text-gray-600">{risk.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Auto Approval */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">
              Auto Approval
            </Text>
            <Switch
              value={autoApproval}
              onValueChange={(value: boolean) => setAutoApproval(value)}
              trackColor={{ false: "#D1D5DB", true: "#10B981" }}
              thumbColor={autoApproval ? "#FFFFFF" : "#FFFFFF"}
            />
          </View>
          <Text className="text-sm text-gray-600">
            Automatically approve reinvestments that match your criteria without
            manual review
          </Text>
        </View>

        {/* Max Per Project */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200 mb-10">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Max Investment Per Project
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Maximum percentage of your portfolio to invest in a single project
          </Text>
          <View className="flex-row items-center">
            <TextInput
              value={maxPerProject.toString()}
              onChangeText={(text) => setMaxPerProject(parseInt(text) || 25)}
              className="flex-1 h-12 px-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-medium mr-2"
              placeholder="25"
              keyboardType="numeric"
            />
            <Text className="text-lg font-medium text-gray-600">%</Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-black rounded-lg p-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Review & Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReinvestSettings;
