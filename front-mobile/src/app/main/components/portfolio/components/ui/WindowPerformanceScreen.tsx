import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import {
  fetchWindowPerformance,
  WindowMetric,
} from "@main/services/windowPerformance";
import { WindowPerformanceSkeleton } from "./index";

const DECORATIVE_CIRCLES = require("@assets/icons.png");

export default function WindowPerformanceScreen() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<WindowMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWindowPerformance().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  return (
    <LinearGradient
      colors={["#D1FAE5", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.3 }}
      className="flex-1 pt-12"
    >
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} className="ml-2">
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>

      {/* Decorative image */}
      <Image
        source={DECORATIVE_CIRCLES}
        resizeMode="contain"
        className="w-full h-52 mt-4"
      />

      <ScrollView className="pt-12 px-4 pb-6">
        {/* Header */}
        <View className="items-center mb-6 z-10">
          <Text className="text-3xl font-bold text-gray-900">
            Past performance
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center px-4">
            Discover the standout statistics from our previous Exit Windows
          </Text>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row flex-wrap justify-between">
          {loading
            ? [1, 2, 3, 4].map((id) => <WindowPerformanceSkeleton key={id} />)
            : metrics.map(({ id, icon, value, label }) => (
                <View
                  key={id}
                  className="bg-white w-[48%] rounded-xl py-5 px-3 mb-4 items-center shadow-md"
                >
                  <Feather name={icon as any} size={28} color="#10B981" />
                  <Text className="text-2xl font-bold text-gray-900 mt-2">
                    {value}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center mt-1">
                    {label}
                  </Text>
                </View>
              ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
