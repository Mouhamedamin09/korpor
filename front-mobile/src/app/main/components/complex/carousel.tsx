// components/carousel.tsx
import React from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { PaginationDot } from "@main/components/ui/index";

interface CarouselProps {
  images: string[];
  currentIndex: number;
  onScrollEnd: (index: number) => void;
}

const screenWidth = Dimensions.get("window").width;

const Carousel = ({ images, currentIndex, onScrollEnd }: CarouselProps) => {
  const renderItem = ({ item }: ListRenderItemInfo<string>) => (
    <View style={{ width: screenWidth }}>
      <Image
        source={{ uri: item }}
        style={{ width: screenWidth, height: 240 }}
        resizeMode="cover"
      />
    </View>
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
    onScrollEnd(index);
  };

  return (
    <View style={{ position: "relative" }}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={screenWidth}
        onMomentumScrollEnd={handleScrollEnd}
      />

      {images.length > 1 && (
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {images.map((_, index) => (
            <PaginationDot
              key={`dot-${index}`}
              active={currentIndex === index}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default Carousel;
