import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Progress from "react-native-progress";

import { Property } from "@shared/types/property";
import { getPropertyById } from "@main/services/getPropertyById";

// UI / layout pieces
import { Header, GrayContainer } from "@main/components/ui/index";
import {
  Carousel,
  Calculator,
  StepperWithButton,
  AboutProperty,
  Leasing,
  TimelineComp,
  BuildingInfo,
  PropertyPageSkeleton, // <-- imported skeleton
} from "@main/components/complex/index";

// assets
const Bed = require("@assets/bed.png");
const Bath = require("@assets/bath.png");
const Area = require("@assets/land-layers.png");
const StatusIcon = require("@assets/clip.png");
const Dot = require("@assets/dot.png");
const Calendar = require("@assets/calendar1.png");
const Tags = require("@assets/tags.png");
const Percent = require("@assets/mortgage.png");

/* ---------- navigation typing ---------- */
type PropertyPageRouteProp = RouteProp<
  { PropertyPage: { id: string } },
  "PropertyPage"
>;

/* ---------- component ---------- */
const PropertyPage = () => {
  const { params } = useRoute<PropertyPageRouteProp>();
  const { id } = params;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* fetch on mount */
  useEffect(() => {
    (async () => {
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <PropertyPageSkeleton />;
  }

  if (!property) {
    return (
      <View className="p-6">
        <Text className="text-red-600 text-lg">Property not found.</Text>
      </View>
    );
  }

  /* investment bounds */
  const minInvestment = property.min_investment ?? 0;
  const maxInvestment =
    (property.total_needed ?? 0) - (property.current_funded ?? 0);

  return (
    <View className="bg-white flex-1">
      <Header />

      <ScrollView className="pb-2">
        {/* image carousel */}
        <Carousel
          images={property.images}
          currentIndex={currentIndex}
          onScrollEnd={setCurrentIndex}
        />

        {/* title & quick facts */}
        <View className="px-4">
          <Text className="text-4xl font-bold mt-4">
            {property.name}, {property.location}
          </Text>

          <View className="flex-row items-center">
            <Image source={Bed} className="h-4 w-4" />
            <Text className="text-lg font-medium">
              {" "}
              {property.rooms ?? "—"}{" "}
            </Text>

            <Image source={Dot} className="h-6 w-6" />

            <Image source={Bath} className="h-4 w-4" />
            <Text className="text-lg font-medium">
              {" "}
              {property.bathrooms ?? "—"}{" "}
            </Text>

            <Image source={Dot} className="h-6 w-6" />

            <Image source={StatusIcon} className="h-4 w-4" />
            <Text className="text-lg font-medium"> {property.status} </Text>

            <Image source={Dot} className="h-6 w-6" />

            <Image source={Area} className="h-4 w-4" />
            <Text className="text-lg font-medium">
              {" "}
              {property.area ?? "—"} m²{" "}
            </Text>
          </View>

          {/* long description */}
          <AboutProperty description={property.description ?? ""} />

          {/* financial block */}
          <View className="px-2">
            <GrayContainer>
              {[
                ["funding goal:", property.total_needed],
                ["funded:", property.current_funded],
                ["return:", `${property.annual_return_rate}% yearly`],
                ["minimum investment:", property.min_investment],
                ["expected ROI:", `${property.expected_roi}%`],
              ].map(([label, value]) => (
                <View key={label} className="flex-row justify-between">
                  <Text className="text-zinc-500 text-md">{label}</Text>
                  <Text className="font-medium text-md">
                    {typeof value === "number"
                      ? value.toLocaleString() +
                        (label === "return:" ? "" : " DT")
                      : value}
                  </Text>
                </View>
              ))}

              {/* green highlight */}
              <View className="bg-green-200 p-2 px-4 rounded-xl mt-2">
                <View className="mb-2 flex-row justify-between">
                  <View className="flex-row">
                    <Image source={Calendar} className="h-4 w-4" />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">{property.upload_date}</Text>
                  </View>
                  <View className="flex-row">
                    <Image source={Tags} className="h-4 w-4" />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">
                      {property.current_value.toLocaleString()} DT
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Image source={Percent} className="h-4 w-4" />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">
                      {property.funding_percentage}%
                    </Text>
                  </View>
                </View>
                <Progress.Bar
                  progress={property.funding_percentage / 100}
                  width={null}
                  height={4}
                  color="#42ce8f"
                  unfilledColor="#d4d4d8"
                />
              </View>
            </GrayContainer>

            {/* interaction widgets */}
            <StepperWithButton min={minInvestment} max={maxInvestment} />
            <Calculator />
            <Leasing
              status={property.status}
              type={property.type}
              fee={0 /* backend doesn’t expose annual_fee yet */}
            />
            <TimelineComp step={2} />
            <BuildingInfo
              propertyAge={
                property.construction_year
                  ? `${
                      new Date().getFullYear() - property.construction_year
                    } years`
                  : "—"
              }
              developerName="Korpor Inc."
              developerSite="https://korpor.com"
              address={"—"}
              locationQuery={property.location}
              documents={[]}
            />

            {/* bottom padding */}
            <View className="h-10" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PropertyPage;
