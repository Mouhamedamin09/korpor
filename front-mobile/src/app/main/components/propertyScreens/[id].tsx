import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { Property } from "@shared/types/property";
import { RouteProp, useRoute } from "@react-navigation/native";
import { GrayContainer, Header } from "@main/components/ui/index";
import {
  Calculator,
  Carousel,
  StepperWithButton,
  AboutProperty,
  Leasing,
  TimelineComp,
} from "@main/components/complex/index";
import * as Progress from "react-native-progress";
const Investors = require("@assets/user-salary.png");
const Status = require("@assets/clip.png");
const Bed = require("@assets/bed.png");
const Marker = require("@assets/marker.png");
const Calendar = require("@assets/calendar1.png");
const Tags = require("@assets/tags.png");
const Dot = require("@assets/dot.png");
const Bath = require("@assets/bath.png");
const Area = require("@assets/land-layers.png");
const Precentage = require("@assets/mortgage.png");

const mockProperty: Property = {
  id: "PROP999999",
  name: "Luxury Beachfront Villa",
  location: "Hammamet",
  rooms: 5,
  bathrooms: 3,
  area: 320,
  status: "Rented",
  upload_date: "2025-04-19",
  current_value: 850000,
  annual_return_rate: 9.2,
  total_needed: 700000,
  current_funded: 420000,
  funding_percentage: 60,
  min_investment: 1000,
  expected_roi: 13.5,
  type: "Long-term rental",
  annual_fee: 78000,
  description:
    "This luxury villa offers stunning ocean views, modern design, and access to private beaches. Ideal for long-term rentals or vacation stays. Secure your investment in high-end coastal real estate.",
  images: [
    "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
    "https://www.kanaga-at.com/wp-content/uploads/2021/07/tunisia_tunisi_foto_i._fornasiero.jpg",
    "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
    "https://www.kanaga-at.com/wp-content/uploads/2021/07/tunisia_tunisi_foto_i._fornasiero.jpg",
    "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
    "https://www.kanaga-at.com/wp-content/uploads/2021/07/tunisia_tunisi_foto_i._fornasiero.jpg",
    // More image URLs
  ],
};

type PropertyPageRouteProp = RouteProp<
  {
    PropertyPage: { id: string };
  },
  "PropertyPage"
>;

const PropertyPage = () => {
  const route = useRoute<PropertyPageRouteProp>();
  const { id } = route.params;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setProperty(mockProperty); // Simulating fetching data
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  if (!property) {
    return (
      <View className="p-6">
        <Text className="text-red-600 text-lg">Property not found.</Text>
      </View>
    );
  }

  const minInvestment = property.min_investment ?? 1000;
  const maxInvestment =
    (property.total_needed ?? 0) - (property.current_funded ?? 0);

  return (
    <View className="bg-white flex-1">
      <Header />
      <ScrollView className="pb-4">
        <Carousel
          images={property.images ?? []}
          currentIndex={currentIndex}
          onScrollEnd={setCurrentIndex}
        />
        {/* Property Info */}
        <View className="px-4">
          <Text className="text-4xl font-bold mt-4">
            {property.name}, {property.location}
          </Text>
          <View className="flex-row">
            <Image
              source={Bed}
              style={{ resizeMode: "contain" }}
              className="h-4 w-4 self-center"
            />
            <Text className="text-lg font-medium">
              {" "}
              {property.rooms ?? "—"}
            </Text>
            <Image source={Dot} className="h-6 w-6 self-center" />
            <Image
              source={Bath}
              style={{ resizeMode: "contain" }}
              className="h-4 w-4 self-center"
            />
            <Text className="text-lg font-medium">
              {" "}
              {property.bathrooms ?? "—"}
            </Text>
            <Image source={Dot} className="h-6 w-6 self-center" />
            <Image
              source={Status}
              style={{ resizeMode: "contain" }}
              className="h-4 w-4 self-center"
            />
            <Text className="text-lg font-medium"> {property.status}</Text>
            <Image source={Dot} className="h-6 w-6 self-center" />
            <Image
              source={Area}
              style={{ resizeMode: "contain" }}
              className="h-4 w-4 self-center"
            />
            <Text className="text-lg font-medium">
              {" "}
              {property.area ?? "—"}m²
            </Text>
          </View>
          {/* Property Description */}
          <AboutProperty description={property.description ?? ""} />
          <View className="px-2">
            {/* Additional Property Info */}
            <GrayContainer>
              <View className="flex-row justify-between">
                <Text className="text-zinc-500 text-md">funding goal:</Text>
                <Text className="font-medium text-md">
                  {property.total_needed?.toLocaleString()} DT
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-500 text-md">funded:</Text>
                <Text className="font-medium text-md">
                  {property.current_funded?.toLocaleString()} DT
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-500 text-md">return:</Text>
                <Text className="font-medium text-md">
                  {property.annual_return_rate}% yearly
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-zinc-500 text-md">
                  minimum investment:
                </Text>
                <Text className="font-medium text-md">
                  {property.min_investment?.toLocaleString()} DT
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-zinc-500 text-md">expected ROI:</Text>
                <Text className="font-medium text-md">
                  {property.expected_roi}%
                </Text>
              </View>
              {/* Green Container */}
              <View className=" bg-green-200 p-2 px-4 rounded-xl">
                <View className="mb-2 flex-row justify-between">
                  <View className="flex-row">
                    <Image source={Calendar} className="h-4 w-4 self-center" />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">{property.upload_date}</Text>
                  </View>
                  <View className="flex-row">
                    <Image source={Tags} className="h-4 w-4 self-center" />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">
                      {property.current_value?.toLocaleString()} DT
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Image
                      source={Precentage}
                      className="h-4 w-4 self-center"
                    />
                    <Text className="text-zinc-500">: </Text>
                    <Text className="font-medium">
                      {property.funding_percentage}%
                    </Text>
                  </View>
                </View>
                <Progress.Bar
                  progress={0.6}
                  width={null}
                  height={4}
                  color="#42ce8f"
                  unfilledColor="#d4d4d8"
                />
              </View>
            </GrayContainer>
            {/* Stepper With Dynamic min/max */}
            <StepperWithButton min={minInvestment} max={maxInvestment} />
            <Calculator />
            <Leasing
              status={property.status}
              type={property.type}
              fee={property.annual_fee ?? 0}
            />
            <TimelineComp step={2} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PropertyPage;
