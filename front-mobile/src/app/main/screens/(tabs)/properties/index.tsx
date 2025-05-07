import React, { useRef, useState, useEffect } from "react";
import { View, Animated } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { TopMenu, PropertyCard } from "@main/components/complex/index";
import { getAllProperties } from "@main/services/getListings"; // same file as above
import { Property } from "@shared/types/property"; // adjust this type if needed

export default function MainApp() {
  const [propertyData, setPropertyData] = useState<Property[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const projects = await getAllProperties();
        setPropertyData(projects); // ✅ only real data
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setPropertyData([]); // fallback = empty list
      }
    })();
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
        keyExtractor={(item) => String(item.id)} // id is numeric in API
        renderItem={({ item }) => <PropertyCard data={item} />}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      />
    </View>
  );
}
