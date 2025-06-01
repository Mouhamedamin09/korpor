import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import { ExitStrategiesCard } from "./index";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";

const ExitWindowScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <TopBar title="Exit Window" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="px-4 pt-6"
      >
        <View className="items-center mb-6">
          <View className="bg-gray-100 rounded-full p-4 mb-4">
            <Feather name="shopping-bag" size={32} color="#10B981" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            Exit window closed
          </Text>
          <Text className="text-sm text-gray-600 mb-2">Next window opens:</Text>
          <View className="bg-white px-4 py-2 rounded-full border border-gray-200">
            <Text className="text-sm font-medium text-gray-900">
              November 3, 2025, 9:00 PM
            </Text>
          </View>
          <Text className="text-xs text-center text-gray-500 mt-4">
            Eligible properties can be listed for sale in the 2-week exit
            windows held every May and November.
          </Text>
        </View>

        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-900">
              Next window
            </Text>
            <TouchableOpacity className="px-3 py-1 rounded-full bg-gray-100">
              <Text className="text-xs text-gray-600">Reminder set</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-base font-semibold text-gray-900">
            Nov 03 – Nov 17, 2025
          </Text>
        </View>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mr-2"
          >
            <Feather name="shopping-bag" size={20} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900 mt-2">
              Buy secondary listings
            </Text>
            <View className="flex-1" />
            <View className="flex-row">
              <Text className="text-sm text-[#10B981] font-semibold">
                View listings
              </Text>
              <Feather name="chevron-right" size={18} color={"#10B981"} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-1 bg-white border border-gray-200 rounded-xl p-4 ml-2 h-40"
          >
            <Feather name="tag" size={20} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900 mt-2">
              Sell your Stakes
            </Text>
            <View className="flex-1" />
            <View className="flex-row">
              <Text className="text-sm text-[#10B981] font-semibold">
                My Stakes
              </Text>
              <Feather name="chevron-right" size={18} color={"#10B981"} />
            </View>
          </TouchableOpacity>
        </View>

        {[
          {
            label: "History",
            icon: "rotate-ccw",
            route: "main/components/portfolio/components/ui/ExitHistoryScreen",
          },
          {
            label: "Window performance",
            icon: "activity",
            route:
              "main/components/portfolio/components/ui/WindowPerformanceScreen",
          },
          { label: "How it works", icon: "info", route: "" },
        ].map(({ label, icon, route }) => (
          <TouchableOpacity
            key={label}
            className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center mb-3"
            onPress={() => {
              router.push(route);
            }}
          >
            <Feather name={icon as any} size={20} color="#000" />
            <Text className="ml-4 text-base font-medium text-gray-900">
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        <View className="mb-4" />
        <ExitStrategiesCard />
      </ScrollView>

      {/* ────── Bottom Sheet Modal ────── */}
      <BottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Feature locked
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            This feature will unlock when the exit window opens. You’ll be able
            to buy and sell stakes between November 3 and November 17.
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="bg-black py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-base">
              Got it
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default ExitWindowScreen;
