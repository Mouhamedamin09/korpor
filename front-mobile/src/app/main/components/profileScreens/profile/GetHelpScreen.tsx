// app/screens/GetHelpScreen.tsx

import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import {
  TopBar,
  ListItem,
} from "@main/components/profileScreens/components/ui";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";

const { width: screenWidth } = Dimensions.get("window");

const tourSlides = [
  {
    key: "expertise",
    image: require("@assets/Real_estitate.png"),
    title: "Real estate expertise",
    subtitle:
      "Over 20 years of leadership experience at the top real estate companies in Tunisia",
  },
  {
    key: "exit",
    image: require("@assets/exit_window.png"),
    title: "Exit windows",
    subtitle:
      "Actively manage your portfolio and take control of the exit process when you need it most",
  },
  {
    key: "income",
    image: require("@assets/monthly-income.png"),
    title: "Monthly income",
    subtitle:
      "Consistent passive income from monthly rent, with capital appreciation as the property value grows",
  },
  {
    key: "start",
    image: require("@assets/start-500.png"),
    title: "Start from TND 500",
    subtitle:
      "We're breaking down barriers – low minimums and no large down payments or mortgages",
  },
];

export default function GetHelpScreen() {
  const router = useRouter();
  const [tourVisible, setTourVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onTourScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(idx);
  };

  return (
    <>
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: 16 }}>
        <TopBar title="Get help" onBackPress={() => router.back()} />

        <View className="px-4 pb-4">
          <Text className="text-lg font-bold text-surfaceText mb-2">
            Help resources
          </Text>
          <ListItem
            iconName="help-circle"
            label="FAQs"
            onPress={() => router.push("/help")}
          />
          <ListItem
            iconName="book"
            label="Glossary"
            onPress={() =>
              router.push("main/components/profileScreens/profile/Glossary")
            }
          />
          <ListItem
            iconName="info"
            label="How it Works"
            onPress={() =>
              Linking.openURL("https://youtube.com/korporchannel/videoname")
            }
          />
          <ListItem
            iconName="compass"
            label="Welcome tour"
            onPress={() => setTourVisible(true)}
          />

          <Text className="text-lg font-bold text-surfaceText mt-6 mb-2">
            Contact us
          </Text>
          <ListItem
            iconName="message-square"
            label="Live chat"
            onPress={() =>
              router.push(
                "main/components/profileScreens/profile/LiveChatScreen"
              )
            }
          />
          <ListItem
            iconName="message-circle"
            label="WhatsApp us"
            onPress={() => Linking.openURL("https://wa.me/21629453228")}
          />
          <ListItem
            iconName="mail"
            label="Email"
            onPress={() => Linking.openURL("mailto:korpor@contact.com")}
          />
        </View>

        <View className="items-center mb-4">
          <Text className="text-xs text-textGray">Version 1.0</Text>
        </View>
      </ScrollView>

      <BottomSheet visible={tourVisible} onClose={() => setTourVisible(false)}>
        <View style={{ width: screenWidth, height: 380 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onTourScroll}
          >
            {tourSlides.map((slide) => (
              <View
                key={slide.key}
                style={{
                  width: screenWidth,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 24,
                  transform: [{ translateX: -16 }], // shift ~5 mm left
                }}
              >
                <Image
                  source={slide.image}
                  style={{
                    width: screenWidth * 0.8,
                    height: 260,
                    resizeMode: "contain",
                    marginBottom: 20,
                  }}
                />

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#1F2937",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {slide.title}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#4B5563",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {slide.subtitle}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* pagination dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 12,
              transform: [{ translateX: -16 }], // shift all dots ~5 mm to the left
            }}
          >
            {tourSlides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: i === currentSlide ? "#000" : "#C4C4C4",
                }}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
