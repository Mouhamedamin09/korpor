// ─── src/screens/main/components/profileScreens/profile/AboutScreen.tsx ──────────────────────────────────────────
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Easing } from "react-native";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import {
  TopBar,
  NewsCard,
  PersonalCard,
} from "@main/components/profileScreens/components/ui";
import {
  getNumbers,
  getBackersLogos,
  getNews,
  getFounders,
  getRating,
  Numbers,
  NewsItem,
  Founder,
} from "@main/services/api";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = 96;

const BackersCarousel: React.FC<{ logos: string[] }> = ({ logos }) => {
  const [items, setItems] = useState<string[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // duplicate logos for seamless scroll
    setItems([...logos, ...logos]);
  }, [logos]);

  const TOTAL_WIDTH = logos.length * ITEM_WIDTH;
  const animate = () => {
    scrollX.setValue(0);
    Animated.timing(scrollX, {
      toValue: -TOTAL_WIDTH,
      duration: 8000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => finished && animate());
  };

  useEffect(() => {
    if (items.length) animate();
    return () => scrollX.stopAnimation();
  }, [items]);

  return (
    <View className="overflow-hidden h-16">
      <Animated.View
        style={{
          flexDirection: "row",
          width: TOTAL_WIDTH * 2,
          transform: [{ translateX: scrollX }],
        }}
      >
        {items.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{
              width: 80,
              height: 40,
              marginHorizontal: 8,
              resizeMode: "contain",
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const AboutScreen: React.FC = () => {
  const [numbers, setNumbers] = useState<Numbers>({
    userCount: "0",
    propertyVolume: "0"
  });
  const [backers, setBackers] = useState<string[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    getNumbers().then(setNumbers).catch(console.error);
    getBackersLogos().then(setBackers).catch(console.error);
    getNews().then(setNewsItems).catch(console.error);
    getFounders().then(setFounders).catch(console.error);
    getRating().then(setRating).catch(console.error);
  }, []);

  const abbreviate = (n: string): string => {
    const num = parseInt(n);
    if (num >= 1_000_000_000) return `${Math.floor(num / 1_000_000_000)}B+`;
    if (num >= 1_000_000) return `${Math.floor(num / 1_000_000)}M+`;
    if (num >= 1_000) return `${Math.floor(num / 1_000)}K+`;
    return n;
  };

  return (
    <View className="flex-1 bg-background">
      <TopBar title="About" onBackPress={() => router.back()} />
      <ScrollView className="flex-1">
        {/* Korpor in numbers */}
        <View className="px-4 mt-4">
          <Text className="text-lg font-semibold text-text mb-4">
            Korpor in numbers
          </Text>
          <View className="flex-row mb-10">
            <View className="flex-1 bg-brandDark rounded-2xl p-6 items-center shadow-lg mr-4">
              <Text className="text-3xl font-extrabold text-white">
                {abbreviate(numbers.userCount)}
              </Text>
              <Text className="mt-3 text-xs font-medium text-mutedText uppercase tracking-wide text-center">
                Registered users
              </Text>
            </View>
            <View className="flex-1 bg-brandDark rounded-2xl p-6 items-center shadow-lg">
              <Text className="text-3xl font-extrabold text-white">
                {abbreviate(numbers.propertyVolume)}
              </Text>
              <Text className="mt-3 text-xs font-medium text-mutedText uppercase tracking-wide text-center">
                Property volume
              </Text>
            </View>
          </View>
        </View>

        {/* Our backers */}
        <View className="px-4 mb-10">
          <Text className="text-lg font-semibold text-text mb-4">
            Our backers
          </Text>
          <Text className="text-sm text-textGray mb-6">
            A big thank-you to our backers.
          </Text>
          <BackersCarousel logos={backers} />
        </View>

        {/* In the news */}
        <View className="px-4 mb-14">
          <Text className="text-lg font-semibold text-text mb-4">
            In the news
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            {newsItems.map((item, idx) => (
              <NewsCard
                key={idx}
                imageUrl={item.imageUrl}
                date={item.date}
                title={item.title}
              />
            ))}
          </ScrollView>
        </View>

        {/* Meet the founders */}
        <View className="px-4 mb-14">
          <Text className="text-lg font-semibold text-text mb-4">
            Meet the founders
          </Text>
          {founders.map((f, i) => (
            <PersonalCard
              key={i}
              imageUrl={f.imageUrl}
              linkedInUrl={f.linkedInUrl}
              name={f.name}
              role={f.role}
              description={f.description}
            />
          ))}
        </View>

        {/* Join our global investors */}
        <View className="px-4 pt-6 border-t border-border flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-text">
            Join our global investors
          </Text>
          <View className="flex-row items-center">
            <Feather name="star" size={20} color="#f59e0b" />
            <Text className="ml-2 text-sm text-gray-800">
              {rating.toFixed(1)} rating
            </Text>
          </View>
        </View>

        {/* Footer link */}
        <View className="px-4 py-6 items-center">
          <TouchableOpacity className="flex-row items-center">
            <Feather name="external-link" size={24} color="#111827" />
            <Text className="ml-3 text-base font-medium text-success">
              Visit the Stake website →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;
