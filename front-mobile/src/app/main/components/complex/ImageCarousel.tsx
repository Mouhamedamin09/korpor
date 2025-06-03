import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 220;

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({
  images = [],
  autoPlay = true,
  interval = 4000,
}: CarouselProps) {
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const dotOpacity = useSharedValue(0);
  useEffect(() => {
    dotOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(() => {
      const next = (index + 1) % images.length;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, images.length, index, interval]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIdx);
  };

  const dotStyle = (i: number) =>
    useAnimatedStyle(() => ({
      opacity: dotOpacity.value,
      backgroundColor: i === index ? "#ffffff" : "rgba(255,255,255,0.45)",
    }));

  return (
    <View className="relative">
      <FlatList
        ref={flatRef}
        data={images}
        keyExtractor={(uri, i) => uri?.toString() + i}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height: IMG_HEIGHT }}
            resizeMode="cover"
          />
        )}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 90,
        }}
      />
      <View className="absolute bottom-3 self-center flex-row">
        {images.map((_, i) => {
          const AnimatedDot = Animated.View;
          return (
            <TouchableOpacity
              key={i.toString()}
              onPress={() =>
                flatRef.current?.scrollToIndex({ index: i, animated: true })
              }
              activeOpacity={0.7}
            >
              <AnimatedDot
                style={[
                  {
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    marginHorizontal: 4,
                  },
                  dotStyle(i),
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
