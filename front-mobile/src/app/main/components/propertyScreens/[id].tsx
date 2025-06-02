import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, SafeAreaView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { Property } from "@shared/types/property";
import { getPropertyById } from "@/app/main/services/getPropertyById";

import { Header, GrayContainer } from "@main/components/ui/index";
import { InvestmentCard } from "@main/components/complex/index";
import {
  Carousel,
  AboutProperty,
  Leasing,
  StepperWithButton,
  Calculator,
  TimelineComp,
  BuildingInfo,
  PropertyPageSkeleton,
} from "@main/components/complex/index";
import { Card } from "../profileScreens/components/ui";
import { OutlinedButton } from "@auth/components/ui/index";

const Bed = require("@assets/bed.png");
const Bath = require("@assets/bath.png");
const Area = require("@assets/land-layers.png");
const StatusIcon = require("@assets/clip.png");
const Dot = require("@assets/dot.png");

type PropertyPageRouteProp = RouteProp<
  { PropertyPage: { id: string } },
  "PropertyPage"
>;

const PropertyPage = () => {
  const { params } = useRoute<PropertyPageRouteProp>();
  const { id } = params;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (loading) return <PropertyPageSkeleton />;
  if (!property)
    return (
      <View className="p-6">
        <Text className="text-red-600 text-lg">Property not found.</Text>
      </View>
    );

  const minInvestment = property.min_investment ?? 0;
  const maxInvestment =
    (property.total_needed ?? 0) - (property.current_funded ?? 0);

  const handleCheckout = () => {
    console.log("Proceed to checkout");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      <ScrollView className="pb-32">
        <Carousel
          images={property.images}
          currentIndex={currentIndex}
          onScrollEnd={setCurrentIndex}
        />
        <View className="px-4 mt-4">
          <Text className="text-4xl font-bold">
            {property.name}, {property.location}
          </Text>
          <View className="flex-row items-center mt-2 space-x-2">
            <Image source={Bed} className="h-4 w-4" />
            <Text className="text-lg font-medium">{property.rooms ?? "—"}</Text>
            <Image source={Dot} className="h-6 w-6" />
            <Image source={Bath} className="h-4 w-4" />
            <Text className="text-lg font-medium">
              {property.bathrooms ?? "—"}
            </Text>
            <Image source={Dot} className="h-6 w-6" />
            <Image source={StatusIcon} className="h-4 w-4" />
            <Text className="text-lg font-medium">{property.status}</Text>
            <Image source={Dot} className="h-6 w-6" />
            <Image source={Area} className="h-4 w-4" />
            <Text className="text-lg font-medium">
              {property.area ?? "—"} m²
            </Text>
          </View>
          <AboutProperty description={property.description ?? ""} />
          <View className="mt-4">
            <InvestmentCard property={property} />
          </View>
          <Text className="text-2xl font-semibold text-primary mt-6">
            Initial Investment
          </Text>
          <Calculator min={minInvestment} max={maxInvestment} />
          <Card extraStyle="mt-4">
            <Leasing status={property.status} type={property.type} fee={0} />
            <TimelineComp currentStep={2} />
          </Card>
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
            address="—"
            locationQuery={property.location}
            documents={[]}
          />
          <View className="h-10" />
        </View>
      </ScrollView>

      <View className="absolute bottom-4 left-4 right-4">
        <OutlinedButton
          title="Checkout"
          onPress={handleCheckout}
          width="full"
        />
      </View>
    </SafeAreaView>
  );
};

export default PropertyPage;
