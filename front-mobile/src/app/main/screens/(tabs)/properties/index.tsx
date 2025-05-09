import React, { useRef, useState, useEffect, useMemo } from "react";
import { View, Animated } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import {
  TopMenu,
  PropertyCard,
  PropertyCardSkeleton,
} from "@main/components/complex/index";
import { getAllProperties } from "@main/services/getListings";
import {
  filterByCategory,
  PropertyCategory,
} from "@main/services/propertyUtils";
import { Property } from "@shared/types/property";

type CategorizedProperty = Property & { category: PropertyCategory };

export default function MainApp() {
  const [propertyData, setPropertyData] = useState<CategorizedProperty[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory>("Available");
  const [loading, setLoading] = useState(true); // <== Add loading state

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllProperties();
        setPropertyData(data as CategorizedProperty[]);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false); // <== Mark loading complete
      }
    })();
  }, []);

  const filtered = useMemo(
    () => filterByCategory(propertyData, selectedCategory),
    [propertyData, selectedCategory]
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y > lastScrollY.current + 5 && headerVisible.current) {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
          headerVisible.current = false;
        } else if (y < lastScrollY.current - 15 && !headerVisible.current) {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          headerVisible.current = true;
        }
        lastScrollY.current = y;
      },
    }
  );

  return (
    <View className="bg-primary-foreground flex-1">
      <TopMenu
        translateY={translateY}
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
      />

      {loading ? (
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </Animated.ScrollView>
      ) : (
        <Animated.FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PropertyCard data={item} />}
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        />
      )}
    </View>
  );
}
