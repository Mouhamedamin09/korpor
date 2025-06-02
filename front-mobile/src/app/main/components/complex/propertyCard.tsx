import { View, Text, TouchableOpacity } from "react-native";
import { ImageCarousel } from "../ui/index";
import React from "react";
import * as Progress from "react-native-progress";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";

export default function PropertyCard({ data }: { data: any }) {
  const {
    id,
    name,
    location,
    rooms,
    status,
    upload_date,
    annual_return_rate,
    total_needed,
    current_funded,
    funding_percentage,
    images = [],
  } = data;

  const progressValue = (funding_percentage || 0) / 100;
  const GREEN = "#34D37D";
  const InfoRow = ({ icon, label }: { icon: string; label: string }) => (
    <View className="flex-row items-center">
      <Feather name={icon} size={18} color="#71717a" />
      <Text className="text-zinc-500 text-lg"> :</Text>
      <View className="px-0.5" />
      <Text className="font-medium text-lg">{label}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "main/components/propertyScreens/[id]",
          params: { id },
        })
      }
      className="rounded-xl border border-gray-200 bg-white w-[94%] self-center mt-5 shadow-sm"
    >
      <View className="h-4" />
      <ImageCarousel images={images} />

      <View className="pl-4 py-4">
        <Text className="text-2xl font-medium">{name}</Text>

        <View className="flex-row justify-between pr-6">
          <View className="flex-1 space-y-1">
            <InfoRow icon="clipboard" label={status} />
            <InfoRow icon="home" label={rooms ?? "—"} />
          </View>

          <View className="flex-1 space-y-1">
            <InfoRow icon="map-pin" label={location} />
            <InfoRow icon="users" label="N/A" />
          </View>

          <View className="flex-1 space-y-1">
            <InfoRow icon="calendar" label={upload_date} />
            <InfoRow icon="tag" label={`${total_needed.toLocaleString()} DT`} />
          </View>
        </View>
      </View>

      <View className="px-4 py-2 mb-2 rounded-lg w-[95%] self-center bg-zinc-100">
        <View className="pb-2 space-y-1">
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">yearly ROI:</Text>
            <Text className="font-medium text-md">{annual_return_rate}%</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">funding needed:</Text>
            <Text className="font-medium text-md">
              {total_needed.toLocaleString()} DT
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">current funded:</Text>
            <Text className="font-medium text-md">
              {current_funded.toLocaleString()} DT
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">funding %:</Text>
            <Text
              className={`font-medium text-md ${
                funding_percentage === 100 ? "text-[#2b7fff]" : "text-[#42ce8f]"
              }`}
            >
              {funding_percentage}%
            </Text>
          </View>
        </View>
        <Progress.Bar
          progress={progressValue}
          width={null}
          height={4}
          color={progressValue === 1 ? "#2b7fff" : "#42ce8f"}
          unfilledColor="#d4d4d8"
        />
      </View>
    </TouchableOpacity>
  );
}
