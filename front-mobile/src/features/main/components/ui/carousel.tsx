import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Modal,
  Text,
  Pressable,
  Dimensions,
  Image as RNImage,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ImageCarouselProps {
  images: string[];
  width?: number;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  width = 200,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: screenWidth,
    height: screenHeight * 0.8,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Reanimated shared values
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  // TS complains incorrectly about animated transform types – safe to ignore
  // @ts-expect-error: transform typing is incorrect but works at runtime
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const openImage = (uri: string, index: number) => {
    RNImage.getSize(uri, (w, h) => {
      const ratio = w / h;
      const maxWidth = screenWidth * 0.95;
      const maxHeight = screenHeight * 0.8;

      let displayWidth = maxWidth;
      let displayHeight = displayWidth / ratio;

      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * ratio;
      }

      setImageDimensions({ width: displayWidth, height: displayHeight });
      setActiveIndex(index);
      setModalVisible(true);

      // Reset and start animation
      scale.value = 0.9;
      opacity.value = 0;

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: screenWidth * index,
          animated: false,
        });
        scale.value = withTiming(1, { duration: 250 });
        opacity.value = withTiming(1, { duration: 250 });
      }, 50);
    });
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        <View className="w-4" />
        {images.map((uri, index) => (
          <Pressable
            key={index}
            onPress={() => openImage(uri, index)}
            className="h-36 w-[200] rounded-xl overflow-hidden mr-4"
            style={{ width }}
          >
            <RNImage
              source={{ uri }}
              resizeMode="cover"
              className="h-36 rounded-xl"
            />
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent={true}>
        <View className="flex-1 bg-black justify-center items-center">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {images.map((uri, index) => (
              <View
                key={index}
                style={{
                  width: screenWidth,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animated.Image
                  source={{ uri }}
                  style={[
                    {
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                      borderRadius: 12,
                    },
                    // @ts-expect-error: transform typing is incorrect but works at runtime
                    animatedImageStyle,
                  ]}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => setModalVisible(false)}
            className="absolute top-10 right-6 bg-white px-4 py-2 rounded-full"
          >
            <Text className="text-black text-lg">Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

export default ImageCarousel;
