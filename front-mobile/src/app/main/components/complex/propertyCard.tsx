import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import ImageCarousel from "./ImageCarousel";

interface PropertyCardProps {
  data: {
    id: string;
    name: string;
    location: string;
    rooms: number | null;
    status: string;
    upload_date: string;
    annual_return_rate: number;
    total_needed: number;
    current_funded: number;
    funding_percentage: number;
    images: string[];
    property_status: "available" | "under_review" | string;
  };
}

export default function PropertyCard({ data }: PropertyCardProps) {
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
    images,
    property_status = "available",
  } = data;

  const progressValue = (funding_percentage || 0) / 100;
  const GREEN = "#34D37D";
  const BLUE = "#2b7fff";

  // Format percentages consistently
  const formatPercentage = (value: number): string => {
    return Number(value || 0).toFixed(1);
  };

  const InfoRow = ({
    icon,
    label,
  }: {
    icon: string;
    label: string | number;
  }) => (
    <View className="flex-row items-center mb-1">
      <Feather name={icon} size={16} color="#6b7280" />
      <Text className="text-zinc-500 text-sm pl-1">{label}</Text>
    </View>
  );

  const handlePropertyPress = () => {
    console.log("[PropertyCard] Main card clicked for property:", id);
    router.push({
      pathname: "main/components/propertyScreens/[id]",
      params: { id },
    });
  };

  const handleInvestPress = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("[PropertyCard] Invest Now clicked for property:", id);

    // Navigate directly to investment screen
    router.push(`/main/components/propertyScreens/investment/${id}`);
  };

  const isAvailableForInvestment =
    property_status === "available" && funding_percentage < 100;

  return (
    <TouchableOpacity
      onPress={handlePropertyPress}
      className="rounded-2xl border border-gray-200 bg-white w-[94%] self-center mt-6 shadow"
    >
      <View className="relative overflow-hidden rounded-t-2xl">
        <ImageCarousel images={images} />
        <View className="absolute top-0 left-0 right-0 px-4 pt-3">
          <Text className="text-white font-semibold text-xl">{name}</Text>
          {funding_percentage >= 100 && (
            <View className="flex-row items-center mt-1">
              <Feather name="check-circle" size={16} color="#ffffff" />
              <Text className="text-white ml-1 text-sm">Fully funded</Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row justify-between px-4 pt-3">
        <View className="flex-1 mr-2">
          <InfoRow icon="clipboard" label={status} />
          <InfoRow icon="home" label={rooms ?? "—"} />
          <InfoRow icon="calendar" label={upload_date} />
        </View>
        <View className="flex-1 ml-2">
          <InfoRow icon="map-pin" label={location} />
          <InfoRow icon="tag" label={`${total_needed.toLocaleString()} DT`} />
          <InfoRow icon="users" label="N/A" />
        </View>
      </View>

      <View className="bg-zinc-100 rounded-xl px-4 py-3 mx-4 mt-3">
        {[
          ["yearly ROI", `${formatPercentage(annual_return_rate)}%`],
          ["funding needed", `${total_needed.toLocaleString()} DT`],
          ["current funded", `${current_funded.toLocaleString()} DT`],
          ["funding %", `${formatPercentage(funding_percentage)}%`],
        ].map(([title, value]) => (
          <View className="flex-row justify-between mb-[2px]" key={title}>
            <Text className="text-sm text-zinc-500">{`${title}:`}</Text>
            <Text
              className={`text-sm font-medium ${
                title === "funding %" && funding_percentage === 100
                  ? "text-blue-600"
                  : title === "funding %"
                  ? "text-green-600"
                  : "text-gray-800"
              }`}
            >
              {value}
            </Text>
          </View>
        ))}
        <Progress.Bar
          progress={progressValue}
          width={null}
          height={6}
          borderRadius={3}
          color={progressValue === 1 ? BLUE : GREEN}
          unfilledColor="#e5e7eb"
          className="mt-2"
        />
      </View>

      {isAvailableForInvestment && (
        <View className="mx-4 my-4">
          <TouchableOpacity
            onPress={handleInvestPress}
            className="bg-black py-3 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.8}
            delayPressIn={0}
          >
            <Feather name="trending-up" size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base ml-2">
              Invest Now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
