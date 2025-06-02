// screens/main/components/wallet/WalletScreen.tsx

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ViewStyle,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useFocusEffect } from "expo-router";
import { MotiView } from "moti";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import SheetRow from "@main/components/wallet/compoenets/ui/SheetRow";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import Carousel from "@main/components/wallet/compoenets/ui/Carousel";
import AcademyVideoCard from "@main/components/wallet/compoenets/ui/AcademyVideoCard";
import SecurityResourceCard from "@main/components/wallet/compoenets/ui/SecurityResourceCard";

import { fetchWalletBalance, WalletBalance } from "@main/services/wallet";
import { fetchAccountData } from "@main/services/account";
import { fetchUserSettings } from "@main/services/api";

const { width } = Dimensions.get("window");
const ACTION_W = width / 4;
const GREEN = "#34D37D";

const CURRENCY = {
  USD: { symbol: "$", flag: "us", code: "USD" },
  EUR: { symbol: "€", flag: "fr", code: "EUR" },
  TND: { symbol: "TND", flag: "tn", code: "TND" },
} as const;

/* ---------- simple grey pulsing block ---------- */
const PulseBlock = ({
  height,
  width = "100%",
  radius = 8,
  style = {},
}: {
  height: number;
  width?: any;
  radius?: number;
  style?: any;
}) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{ type: "timing", duration: 700, loop: true }}
    style={{
      height,
      width,
      borderRadius: radius,
      backgroundColor: "#E5E7EB",
      ...style,
    }}
  />
);

const WalletScreen: React.FC = () => {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investSheetOpen, setInvestSheetOpen] = useState(false);

  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, account] = await Promise.all([
        fetchWalletBalance(),
        fetchAccountData(),
      ]);

      setWalletData(data);

      // Fetch user settings for currency preference
      const settings = await fetchUserSettings(account.email);
      setUserSettings(settings);
    } catch (e) {
      console.warn("Failed to load wallet data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [loadWalletData])
  );

  // Use user's preferred currency from settings, fallback to wallet currency, then TND
  const currency: "USD" | "EUR" | "TND" =
    userSettings?.currency || walletData?.currency || "TND";
  const cur = CURRENCY[currency];

  return (
    <View className="flex-1 bg-background">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <TopBar
        title="My Wallet"
        rightComponent={
          loading ? (
            <PulseBlock
              height={32}
              width={100}
              radius={16}
              style={{ marginRight: 16 }}
            />
          ) : (
            <TouchableOpacity
              onPress={() =>
                router.push("/main/components/profileScreens/profile/Currency")
              }
              className="flex-row items-center border border-gray-300 rounded-full px-3 py-1"
            >
              <CountryFlag
                isoCode={cur.flag}
                size={16}
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm font-medium text-gray-900 mr-1">
                {cur.code}
              </Text>
              <Feather name="chevron-right" size={16} color="#374151" />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {loading ? (
          <View className="px-4 mt-4 mb-4">
            {/* Carousel skeleton */}
            <PulseBlock height={140} style={{ marginVertical: 2 }} />

            {/* Quick-actions skeleton */}
            <PulseBlock height={90} style={{ marginVertical: 16 }} />

            {/* Payment-method card skeleton */}
            <PulseBlock height={220} style={{ marginVertical: 16 }} />

            {/* Safety card skeleton */}
            <PulseBlock height={280} style={{ marginVertical: 16 }} />

            {/* Academy video card skeleton */}
            <PulseBlock height={140} style={{ marginVertical: 16 }} />

            {/* Learning links row skeleton */}
            <PulseBlock height={100} style={{ marginVertical: 16 }} />
          </View>
        ) : (
          <>
            {/* ── balance carousel ──────────────────────────────────── */}
            <Carousel currency={currency} />

            {/* ── quick-action row ─────────────────────────────────── */}
            <View className="flex-row justify-around mt-6 mb-4 px-2">
              {[
                { icon: "refresh-ccw", label: "Invest" },
                {
                  icon: "plus",
                  label: "Deposit",
                  route: "main/components/wallet/walletscreens/DepositScreen",
                },
                {
                  icon: "arrow-up-right",
                  label: "Withdraw",
                  route: "main/components/wallet/walletscreens/WithdrawScreen",
                },
                {
                  icon: "credit-card",
                  label: "Settings",
                  route: "/main/components/wallet/walletscreens/settings",
                },
              ].map(({ icon, label, route }) => (
                <TouchableOpacity
                  key={label}
                  style={{ width: ACTION_W }}
                  className="items-center"
                  onPress={
                    label === "Invest"
                      ? () => setInvestSheetOpen(true) // open the sheet
                      : () => route && router.push(route)
                  }
                >
                  <View className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 items-center justify-center mb-2">
                    <Feather name={icon as any} size={28} color="#0F172A" />
                  </View>
                  <Text className="text-sm text-gray-900">{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ========== INVEST MODAL SHEET ========== */}
            <BottomSheet
              visible={investSheetOpen}
              onClose={() => setInvestSheetOpen(false)}
            >
              <SheetRow
                icon={<Feather name="home" size={24} color="#10B981" />}
                title="Browse Properties"
                subtitle="Pick and choose properties yourself"
                onPress={() => {
                  setInvestSheetOpen(false);
                  router.push("main/screens/properties");
                }}
              />
              <SheetRow
                icon={<Feather name="zap" size={24} color="#10B981" />}
                title="AutoInvest"
                subtitle="Build a diversified portfolio on autopilot"
                onPress={() => {
                  setInvestSheetOpen(false);
                  router.push(
                    "/main/components/wallet/walletscreens/AutoInvestScreen"
                  );
                }}
              />
            </BottomSheet>

            {/* ── payment-method card ──────────────────────────────── */}
            <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
              <View className="flex-row justify-center mb-4">
                <View className="w-24 h-14 rounded-lg border border-gray-200 items-center justify-center bg-[#F9FAFB] mx-2">
                  <Feather name="home" size={28} color="#0F172A" />
                </View>
                <View className="w-24 h-14 rounded-lg border border-gray-200 items-center justify-center bg-[#F9FAFB] mx-2">
                  <Image
                    source={require("@assets/visa.png")}
                    style={{ width: 70, height: 25 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="w-24 h-14 rounded-lg border border-gray-200 items-center justify-center bg-[#F9FAFB] mx-2">
                  <Image
                    source={require("@assets/mastercard.png")}
                    style={{ width: 46, height: 36 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <Text className="font-semibold text-lg text-gray-900 text-center mb-2">
                Pay with Debit Card or Bank Transfer
              </Text>

              <Text className="text-sm text-gray-600 text-center mb-6">
                Add your bank account or pay instantly at checkout using
                Debit&nbsp;Card
              </Text>

              <TouchableOpacity
                className="bg-[#000000] rounded-2xl py-4 items-center active:opacity-80"
                onPress={() =>
                  router.push(
                    "/main/components/wallet/walletscreens/PaymentMethodScreen"
                  )
                }
              >
                <Text className="text-white text-base font-semibold">
                  Add payment method
                </Text>
              </TouchableOpacity>
            </Card>

            {/* ── safety card ───────────────────────────────────────── */}
            <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
              <View className="flex-row items-center mb-4">
                <View className="w-20 h-20 rounded-2xl bg-green-100 items-center justify-center mr-4">
                  <Image
                    source={require("@assets/kplock.png")}
                    style={{ width: 80, height: 80, marginLeft: 12 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-gray-900">
                    Your money is safe with us
                  </Text>
                  <Text className="text-sm text-gray-600">
                    We take stringent measures to ensure your security.
                  </Text>
                </View>
              </View>

              <View className="h-px bg-gray-200 mb-4" />

              {[
                { icon: "shield", txt: "We're regulated by the CMF" },
                {
                  icon: "archive",
                  txt: "Investments are registered in AMF",
                },
                {
                  icon: "dollar-sign",
                  txt: "Rent is paid monthly into your wallet",
                },
              ].map(({ icon, txt }) => (
                <View key={txt} className="flex-row items-center mb-3">
                  <Feather name={icon as any} size={20} color="#10B981" />
                  <Text className="ml-3 text-base text-gray-900">{txt}</Text>
                </View>
              ))}

              <TouchableOpacity
                className="flex-row items-center mt-4 pt-4 border-t border-gray-200"
                onPress={() =>
                  router.push(
                    "/main/components/profileScreens/profile/SecurityPrivacyScreen"
                  )
                }
              >
                <Text className="text-base font-semibold text-green-700 flex-1">
                  Read more about our security
                </Text>
                <Feather name="chevron-right" size={20} color="#10B981" />
              </TouchableOpacity>
            </Card>

            {/* ── academy video card ───────────────────────────────── */}
            <AcademyVideoCard />

            {/* ── learning links row ───────────────────────────────── */}
            <Text className="text-base font-semibold text-gray-900 mt-6 mb-2 px-4">
              Learn about our security
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {[
                {
                  icon: "credit-card",
                  title: "Learn about deposits\nand withdrawals",
                  read: true,
                  onPress: () =>
                    router.push(
                      "/main/components/profileScreens/profile/DepositsWithdrawalsGuide"
                    ),
                },
                {
                  icon: "shield",
                  title: "How does CMF\nprotect my money?",
                  read: false,
                  onPress: () =>
                    router.push(
                      "/main/components/profileScreens/profile/DFSAProtectionGuide"
                    ),
                },
                {
                  icon: "user",
                  title: "How does AMF\nprotect user Money?",
                  read: false,
                  onPress: () =>
                    router.push(
                      "/main/components/profileScreens/profile/UserMoneyProtectionGuide"
                    ),
                },
                {
                  icon: "lock",
                  title: "How does Korpor protect my data?",
                  read: false,
                  onPress: () =>
                    router.push(
                      "/main/components/profileScreens/profile/DataProtectionGuide"
                    ),
                },
                {
                  icon: "info",
                  title: "What is DIFC?",
                  read: false,
                  onPress: () =>
                    router.push(
                      "/main/components/profileScreens/profile/DIFCGuide"
                    ),
                },
              ].map(({ icon, title, read, onPress }, idx, arr) => (
                <View
                  key={title}
                  style={{
                    width: 260,
                    marginRight: idx === arr.length - 1 ? 0 : 12,
                  }}
                >
                  <SecurityResourceCard
                    icon={icon}
                    title={title}
                    read={read}
                    onPress={onPress}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default WalletScreen;
