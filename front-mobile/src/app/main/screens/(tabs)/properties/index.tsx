import React, { useRef, useState, useEffect } from "react";
import { View, Animated } from "react-native";
import { TopMenu, PropertyCard } from "@main/components/complex/index";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { getAllProperties } from "@main/services/getListings";
import { Property } from "@shared/types/property";

const fillerData: Property[] = [
  {
    id: "FILLER001",
    name: "Test Villa with Pool",
    location: "Hammamet",
    rooms: 4,
    status: "open",
    upload_date: "2025-04-01",
    current_value: 600000,
    annual_return_rate: 9.5,
    total_needed: 500000,
    current_funded: 250000,
    funding_percentage: 50,
    type: "Long term rental",
    images: [
      "https://cdn.getyourguide.com/img/tour/85fbf0e1bce088c90839e0ab657b9fafc3ba2463b4786244ad470ff5762070fe.jpg/98.jpg",
      "https://content.r9cdn.net/rimg/dimg/01/7c/263acba6-city-43985-1683ece0046.jpg?crop=true&width=1366&height=768&xhint=2004&yhint=1326",
      "https://mediaim.expedia.com/destination/9/9b1acd38500c3bb34bf7a07b28bbafc5.jpg",
    ],
  },
  {
    id: "FILLER002",
    name: "Modern Apartment Downtown",
    location: "Tunis",
    type: "Long term rental",
    rooms: 2,
    status: "open",
    upload_date: "2025-04-12",
    current_value: 320000,
    annual_return_rate: 7.8,
    total_needed: 300000,
    current_funded: 120000,
    funding_percentage: 40,
    images: [
      "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/TunisAveHabibBourguiba.jpg/330px-TunisAveHabibBourguiba.jpg",
      "https://guide-voyage-tunisie.com/wp-content/uploads/2022/11/bab-bhar-tunis-1024x768.webp",
    ],
  },
  {
    id: "FILLER003",
    name: "Modern Apartment Downtown",
    location: "Tunis",
    type: "Long term rental",
    rooms: 2,
    status: "open",
    upload_date: "2025-04-12",
    current_value: 320000,
    annual_return_rate: 7.8,
    total_needed: 300000,
    current_funded: 120000,
    funding_percentage: 40,
    images: [
      "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/TunisAveHabibBourguiba.jpg/330px-TunisAveHabibBourguiba.jpg",
      "https://guide-voyage-tunisie.com/wp-content/uploads/2022/11/bab-bhar-tunis-1024x768.webp",
    ],
  },
  {
    id: "FILLER004",
    name: "Modern Apartment Downtown",
    location: "Tunis",
    rooms: 2,
    status: "open",
    upload_date: "2025-04-12",
    current_value: 320000,
    annual_return_rate: 7.8,
    total_needed: 300000,
    type: "Long term rental",
    current_funded: 120000,
    funding_percentage: 10,
    images: [
      "https://media.cntravellerme.com/photos/65ce569d50b47741493c9955/3:2/w_3000,h_2000,c_limit/GettyImages-1478650972.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/TunisAveHabibBourguiba.jpg/330px-TunisAveHabibBourguiba.jpg",
      "https://guide-voyage-tunisie.com/wp-content/uploads/2022/11/bab-bhar-tunis-1024x768.webp",
    ],
  },
];

export default function MainApp() {
  const [propertyData, setPropertyData] = useState<Property[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const properties = await getAllProperties();
        setPropertyData([...fillerData, ...properties]); // ✅ Prepend mock data
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setPropertyData(fillerData); // ✅ Fallback if API fails
      }
    };

    fetchData();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y;

        if (currentY > lastScrollY.current + 5 && headerVisible.current) {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
          headerVisible.current = false;
        } else if (
          currentY < lastScrollY.current - 15 &&
          !headerVisible.current
        ) {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          headerVisible.current = true;
        }

        lastScrollY.current = currentY;
      },
    }
  );

  return (
    <View className="bg-background flex-1">
      <TopMenu translateY={translateY} />
      <Animated.FlatList
        data={propertyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard data={item} />}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      />
    </View>
  );
}
