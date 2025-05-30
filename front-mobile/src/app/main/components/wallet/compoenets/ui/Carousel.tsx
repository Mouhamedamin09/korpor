// components/ui/Carousel.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import { fetchWalletBalance, formatBalance, convertCurrency, WalletBalance } from "@main/services/wallet";

const { width } = Dimensions.get("window");
const CARD_W = width - 32; // screen-padding (px-4) expected
const CARD_H = 160;
const DOT_W = 40;
const GAP = 8; // 8px between dots

type Props = { currency?: 'USD' | 'EUR' | 'TND' };

const pages = [
  {
    title: "Total balance",
    cta: null,
    paintOverlay: () => (
      <>
        <View
          style={{
            position: "absolute",
            left: -60,
            top: -25,
            width: 260,
            height: 110,
            backgroundColor: "rgba(255,255,255,0.06)",
            transform: [{ rotate: "-20deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            right: -80,
            bottom: -25,
            width: 260,
            height: 110,
            backgroundColor: "rgba(255,255,255,0.04)",
            transform: [{ rotate: "-20deg" }],
          }}
        />
      </>
    ),
  },
  {
    title: "Cash balance",
    cta: null,
    paintOverlay: () => (
      <>
        <View
          style={{
            position: "absolute",
            left: -40,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: -60,
            bottom: -70,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
      </>
    ),
  },
  {
    title: "Rewards balance",
    cta: (
      <TouchableOpacity
        className="flex-row items-center self-center mt-4 border border-white/30 rounded-full px-4 py-1"
        onPress={() =>
          router.push(
            "/main/components/profileScreens/profile/ReferAFriendScreen"
          )
        }
      >
        <Feather name="star" size={14} color="#fff" className="mr-1" />
        <Text className="text-[11px] font-semibold text-white mr-1">
          Earn rewards
        </Text>
        <Feather name="chevron-right" size={12} color="#fff" />
      </TouchableOpacity>
    ),
    paintOverlay: () => (
      <>
        <Feather
          name="star"
          size={220}
          color="rgba(255,255,255,0.05)"
          style={{
            position: "absolute",
            left: -50,
            top: -40,
            transform: [{ rotate: "0deg" }],
          }}
        />
        <Feather
          name="star"
          size={200}
          color="rgba(255,255,255,0.05)"
          style={{
            position: "absolute",
            left: 100,
            top: -10,
            transform: [{ rotate: "15deg" }],
          }}
        />
        <Feather
          name="star"
          size={240}
          color="rgba(255,255,255,0.05)"
          style={{
            position: "absolute",
            left: -60,
            top: 50,
            transform: [{ rotate: "30deg" }],
          }}
        />
      </>
    ),
  },
] as const;

const Carousel: React.FC<Props> = ({ currency = "TND" }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const translateX = scrollX.interpolate({
    inputRange: [0, (pages.length - 1) * CARD_W],
    outputRange: [0, (pages.length - 1) * (DOT_W + GAP)],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const data = await fetchWalletBalance();
        setWalletData(data);
      } catch (error) {
        console.error('Error loading wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [currency]);

  const getBalanceForPage = (index: number): string => {
    if (loading || !walletData) {
      return `${currency} 0.00`;
    }

    let amount = 0;
    switch (index) {
      case 0: // Total balance
        amount = walletData.totalBalance;
        break;
      case 1: // Cash balance
        amount = walletData.cashBalance;
        break;
      case 2: // Rewards balance
        amount = walletData.rewardsBalance;
        break;
    }

    // Convert from wallet currency (TND) to display currency and format
    return formatBalance(amount, walletData.currency, currency);
  };

  return (
    <View className="mt-2">
      <Animated.FlatList
        data={pages}
        keyExtractor={(_, i) => `${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => (
          <View style={{ width: CARD_W }} className="px-4">
            <LinearGradient
              colors={["#008F6B", "#00B37D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: CARD_H,
                borderRadius: 20,
                overflow: "hidden",
                padding: 20,
                justifyContent: "center",
              }}
            >
              {item.paintOverlay()}
              <Text className="text-white text-sm font-medium text-center mb-1">
                {item.title}
              </Text>
              <Text className="text-white text-3xl font-bold text-center">
                {getBalanceForPage(index)}
              </Text>
              {item.cta}
            </LinearGradient>
          </View>
        )}
      />

      <View style={{ marginTop: 16, alignSelf: "center" }}>
        <View
          style={{
            width: pages.length * DOT_W + (pages.length - 1) * GAP,
            height: 4,
            position: "relative",
          }}
        >
          {pages.map((_, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: i * (DOT_W + GAP),
                width: DOT_W,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#E5E7EB",
              }}
            />
          ))}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: DOT_W,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#000",
              transform: [{ translateX }],
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Carousel;
