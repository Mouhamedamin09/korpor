// app/screens/ReferAFriendScreen.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import CountryFlag from "react-native-country-flag";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import { fetchReferralInfo, ReferralInfo } from "@main/services/Refer";

const { width: screenWidth } = Dimensions.get("window");
const BLACK = "#000";

export default function ReferAFriendScreen() {
  const router = useRouter();
  const [ref, setRef] = useState<ReferralInfo | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    fetchReferralInfo().then(setRef);
  }, []);

  if (!ref) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={BLACK} />
      </View>
    );
  }

  const { currency, userId, code, referralAmount, minInvestment } = ref;
  const amount =
    currency === "EUR"
      ? `€${referralAmount.toFixed(2)}`
      : `TND ${referralAmount.toFixed(2)}`;
  const minInvest =
    currency === "EUR"
      ? `€${minInvestment.toLocaleString()}`
      : `TND ${minInvestment.toLocaleString()}`;
  const link = `https://app.getkorpor.com/rewards?c=${userId}&n=${code}`;

  async function onShare() {
    const message = `Hi! Join me on Korpor and get ${amount} for FREE, to invest in rental generating investment properties!\n${link}`;
    try {
      await Share.share({ message });
    } catch {}
  }

  const marketName = currency === "EUR" ? "France" : "Tunisia";
  const flagCode = currency === "EUR" ? "FR" : "TN";
  const switchMarketLabel =
    currency === "EUR" ? "Tunisia (TND)" : "France (EUR)";
  const switchFlag = currency === "EUR" ? "TN" : "FR";

  return (
    <View className="flex-1 bg-white">
      <TopBar title="Referrals" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Intro banner */}
        <View className="mx-4 mt-4 p-3 bg-gray-100 rounded-xl flex-row items-center">
          <Text className="text-sm">
            <Text className="font-bold">korpor</Text> Intro{" "}
          </Text>
          <Text className="text-sm font-semibold">
            {amount} for every qualified referral
          </Text>
        </View>

        {/* Hero */}
        <Card extraStyle="mx-4 mt-4 items-center">
          <Image
            source={require("@assets/gift-box.png")}
            style={{
              width: screenWidth - 96,
              height: (screenWidth - 96) * 0.5,
              resizeMode: "contain",
            }}
          />
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            Refer and earn
          </Text>
          <Text className="text-sm text-gray-600 text-center mt-2 px-4">
            Each friend you refer gets {amount}. If they invest over {minInvest}
            , you get {amount}!
          </Text>
        </Card>

        {/* Stats */}
        <View className="flex-row mx-4 mt-4">
          <Card extraStyle="flex-1 mr-2 p-4 items-center">
            <Text className="text-sm text-gray-500">Registered</Text>
            <Text className="text-xl font-semibold text-gray-900 mt-2">0</Text>
          </Card>
          <Card extraStyle="flex-1 ml-2 p-4 items-center">
            <Text className="text-sm text-gray-500">Invested</Text>
            <Text className="text-xl font-semibold text-gray-900 mt-2">0</Text>
          </Card>
        </View>

        {/* Steps */}
        <Card extraStyle="mx-4 mt-4 p-4">
          {[
            {
              num: 1,
              title: "Invite a friend",
              desc: "Using your invite link above",
            },
            {
              num: 2,
              title: `They receive ${amount}`,
              desc: "Once fully onboarded & approved",
            },
            {
              num: 3,
              title: `You receive ${amount}`,
              desc: `When they invest ${minInvest}`,
            },
          ].map((step) => (
            <View key={step.num} className="flex-row items-start mb-4">
              <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="font-bold text-green-600">{step.num}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {step.title}
                </Text>
                <Text className="text-gray-600 mt-1">{step.desc}</Text>
              </View>
            </View>
          ))}
          <Text className="text-xs text-gray-500 mt-2">
            Bonus is paid into your account after your friends’ investments are
            fully funded and closed.
          </Text>
        </Card>

        {/* Footer + Info */}
        <View className="mx-4 mt-4 flex-row items-center">
          <CountryFlag
            isoCode={flagCode}
            size={20}
            style={{ marginRight: 8 }}
          />
          <Text className="text-xs text-gray-600 mr-2">
            Applies to {marketName}
          </Text>
          <TouchableOpacity onPress={() => setSheetVisible(true)}>
            <Feather name="info" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Share button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShare}
          className="mx-4 mt-4 mb-8 flex-row items-center justify-center bg-black py-3 rounded-xl"
        >
          <Feather name="share-2" size={20} color="#fff" />
          <Text className="ml-2 text-white font-semibold">Share link</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Info Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      >
        <Text className="text-lg font-bold text-gray-900 mb-2">
          Referrals in {marketName}
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          Referrals shared while in the {marketName} market will generate a{" "}
          {currency}-specific referral link. This link ensures your referees can
          sign up and access the {marketName} section of Korpor.
        </Text>
        <Text className="text-sm text-gray-600 mb-6">
          If you want your referees to sign up for the other market or receive
          your referral rewards in a different currency, please switch markets
          before sharing your referral link.
        </Text>
        <TouchableOpacity
          onPress={() => setSheetVisible(false)}
          className="w-full bg-black py-3 rounded-lg mb-2"
        >
          <Text className="text-center text-white font-semibold">
            Understood
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            /* TODO: switch market logic */
          }}
          className="w-full flex-row items-center justify-center border border-gray-300 py-3 rounded-lg"
        >
          <CountryFlag
            isoCode={switchFlag}
            size={20}
            style={{ marginRight: 8 }}
          />
          <Text className="text-gray-900 font-semibold">
            {switchMarketLabel}
          </Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}
