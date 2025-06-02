// ui/FundingTimeline.tsx
import React from "react";
import { View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { TimeLine } from "@main/components/ui/index"; // ← your existing step component

type Props = {
  /** 1-based index of the current (active) step */
  currentStep: number;
};

export default function TimelineComp({ currentStep }: Props) {
  return (
    <View>
      {/* ─── header row ─── */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mr-4">
          <Feather name="calendar" size={30} color="#000" />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">
            Funding Timeline
          </Text>
          <Text className="text-sm text-gray-600">
            Track progress from initial funding to first rental payout.
          </Text>
        </View>
      </View>

      {/* ─── graphic timeline ─── */}
      <View className="mx-1 mb-4">
        <TimeLine currentStep={currentStep} />
      </View>

      {/* ─── helper text ─── */}
      <Text className="text-xs text-gray-500">
        Each milestone turns green once completed.
      </Text>
    </View>
  );
}
