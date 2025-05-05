import { View, Text, Image, TouchableOpacity } from "react-native";
import { ImageCarousel } from "../ui/index";
import React from "react";
import * as Progress from "react-native-progress";
import { router } from "expo-router";

const Investors = require("@assets/user-salary.png");
const Status = require("@assets/clipboard-list-check.png");
const Bed = require("@assets/bed-empty.png");
const Marker = require("@assets/marker.png");
const Calendar = require("@assets/calendar1.png");
const Tags = require("@assets/tags.png");

export default function PropertyCard({ data }: { data: any }) {
  const {
    id,
    name,
    location,
    rooms,
    status,
    upload_date,
    current_value,
    annual_return_rate,
    total_needed,
    current_funded,
    funding_percentage,
    images = [],
  } = data;

  const progressValue = (funding_percentage || 0) / 100;

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(`${id} was pressed`);
        router.push({
          pathname: "main/components/propertyScreens/[id]", // dynamic route
          params: { id }, // send the ID to be picked up via useLocalSearchParams
        });
      }}
      className="bg-white rounded-xl border border-zinc-200 w-[94%] self-center mt-5 shadow-md"
    >
      <View className="h-4" />
      <ImageCarousel images={images} />
      <View className="pl-4 py-4">
        <Text className="text-2xl font-medium">{name}</Text>
        <View className="flex-row justify-between pr-6">
          <View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Status} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">{status || "N/A"}</Text>
            </View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Bed} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">{rooms ?? "?"}</Text>
            </View>
          </View>
          <View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Marker} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">
                {location || "Unknown"}
              </Text>
            </View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Investors} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">N/A</Text>
            </View>
          </View>
          <View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Calendar} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">
                {upload_date || "TBD"}
              </Text>
            </View>
            <View className="flex-row">
              <Image className="h-5 w-5 self-center" source={Tags} />
              <Text className="text-zinc-500 text-lg"> :</Text>
              <View className="px-0.5" />
              <Text className="font-medium text-lg">
                {current_value?.toLocaleString() || "—"} DT
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 py-2 mb-2 rounded-lg w-[95%] self-center bg-zinc-100">
        <View className="pb-2">
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">
              yearly investment return:
            </Text>
            <Text className="font-medium text-md">
              {annual_return_rate ?? "—"}%
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">funding needed:</Text>
            <Text className="font-medium text-md">
              {total_needed?.toLocaleString() ?? "—"} DT
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">current funded:</Text>
            <Text className="font-medium text-md">
              {current_funded?.toLocaleString() ?? "—"} DT
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-md">funding %:</Text>
            <Text className="font-medium text-md text-[#42ce8f]">
              {funding_percentage ?? 0}%
            </Text>
          </View>
        </View>
        <Progress.Bar
          progress={progressValue}
          width={null}
          height={4}
          color="#42ce8f"
          unfilledColor="#d4d4d8"
        />
      </View>
    </TouchableOpacity>
  );
}
