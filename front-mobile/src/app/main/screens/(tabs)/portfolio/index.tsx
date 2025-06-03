// screens/main/components/wallet/PortfolioScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import CountryFlag from "react-native-country-flag";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import AcademyVideoCard from "@main/components/wallet/compoenets/ui/AcademyVideoCard";
import SecurityResourceCard from "@main/components/wallet/compoenets/ui/SecurityResourceCard";
import {
  AmountSelector,
  QuickstartCard,
  PortfolioValueCard,
  MonthlyDepositsCard,
  AutoInvest,
  AutoReinvest,
} from "@/app/main/components/portfolio/components/ui/index";
import { fetchAccountData, fetchUserSettings } from "@main/services/api";
import {
  fetchPortfolioTotals,
  fetchAutomationStatus,
  type PortfolioTotals,
  type AutomationStatus,
} from "@/app/main/services/portfolio";

const { width } = Dimensions.get("window");

const CURRENCY = {
  USD: { symbol: "$", flag: "US", code: "USD" },
  EUR: { symbol: "€", flag: "FR", code: "EUR" },
  TND: { symbol: "TND", flag: "TN", code: "TND" },
} as const;

const PortfolioScreen: React.FC = () => {
  const router = useRouter();

  /* ---------------- currency ---------------- */
  const [currency, setCurrency] = useState<keyof typeof CURRENCY>("TND");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  const loadCurrency = useCallback(async () => {
    setLoadingCurrency(true);
    try {
      const { email } = await fetchAccountData();
      const { currency: serverCurrency } = await fetchUserSettings(email);
      if (serverCurrency && serverCurrency in CURRENCY) {
        setCurrency(serverCurrency as keyof typeof CURRENCY);
      }
    } catch (e) {
      console.warn("Failed to load currency, defaulting to TND", e);
    } finally {
      setLoadingCurrency(false);
    }
  }, []);

  /* ---------------- portfolio data ---------------- */
  const [portfolioTotals, setPortfolioTotals] = useState<PortfolioTotals>({
    usd: 0,
    local: 0,
    currency: "TND",
    totalInvested: 0,
    totalReturns: 0,
    monthlyIncome: 0,
    averageYield: 6.5,
  });
  const [automation, setAutomation] = useState<AutomationStatus>({
    autoInvestSetup: false,
    autoReinvestSetup: false,
  });
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const loadPortfolioData = useCallback(async () => {
    setLoadingPortfolio(true);
    try {
      console.log("Loading portfolio data...");

      const [totals, auto] = await Promise.all([
        fetchPortfolioTotals(),
        fetchAutomationStatus(),
      ]);

      console.log("Portfolio totals:", totals);
      console.log("Automation status:", auto);

      setPortfolioTotals(totals);
      setAutomation(auto);
    } catch (e) {
      console.warn("Failed to load portfolio data", e);
    } finally {
      setLoadingPortfolio(false);
    }
  }, []);

  /* ---------------- focus effect ---------------- */
  useFocusEffect(
    useCallback(() => {
      loadCurrency();
      loadPortfolioData();
    }, [loadCurrency, loadPortfolioData])
  );

  const cur = CURRENCY[currency];

  return (
    <View className="flex-1 bg-background">
      <TopBar
        title="Portfolio"
        rightComponent={
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
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <PortfolioValueCard
          usdValue={portfolioTotals.usd}
          localCurrencyCode={cur.code}
          localValue={portfolioTotals.local}
          loading={loadingPortfolio}
        />

        {/* My Investments Card */}
        <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4 mt-4">
          <TouchableOpacity
            onPress={() =>
              router.push("/main/components/portfolio/screens/investments")
            }
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mr-4">
                <Feather name="pie-chart" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-lg text-gray-900 mb-1">
                  My Investments
                </Text>
                <Text className="text-sm text-gray-600">
                  View and manage your real estate investments
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <Text className="text-xs text-green-700 font-medium">
                    Track portfolio performance
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-center">
              <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
                <Feather name="arrow-right" size={18} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
          {/* existing "Start earning" block (unchanged) */}
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-2xl bg-green-100 items-center justify-center mr-4">
              <Image
                source={require("@assets/property.png")}
                style={{ width: 80, height: 80, marginLeft: 5 }}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-lg text-gray-900">
                Start earning on Korpor
              </Text>
              <Text className="text-sm text-gray-600">
                Become a property owner and start earning passive income
              </Text>
            </View>
          </View>

          <View className="h-px bg-gray-200 mb-4" />

          {[
            { icon: "award", txt: "Receive legal ownership documents" },
            { icon: "dollar-sign", txt: "Receive rental payments every month" },
            { icon: "arrow-up", txt: "Earn property appreciation over time" },
          ].map(({ icon, txt }) => (
            <View key={txt} className="flex-row items-center mb-3">
              <Feather name={icon as any} size={20} color="#10B981" />
              <Text className="ml-3 text-base text-gray-900">{txt}</Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/main/components/profileScreens/profile/GetHelpScreen"
              )
            }
            className="flex-row items-center mt-4 pt-4 border-t border-gray-200"
          >
            <Text className="text-base font-semibold text-green-700 flex-1">
              Learn more about Korpor
            </Text>
            <Feather name="chevron-right" size={20} color="#10B981" />
          </TouchableOpacity>
        </Card>

        <QuickstartCard />

        <Text className="ml-5 text-xl font-semibold mt-4">
          How your money could grow
        </Text>
        <MonthlyDepositsCard currencyCode={cur.code} />

        <Text className="ml-5 text-xl font-semibold mt-4">Automations</Text>
        <AutoInvest isSetup={automation.autoInvestSetup} />
        <AutoReinvest isSetup={automation.autoReinvestSetup} />

        {/* Portfolio Performance Summary */}
        {(portfolioTotals.totalInvested > 0 ||
          portfolioTotals.totalReturns > 0) && (
          <>
            <Text className="ml-5 text-xl font-semibold mt-4">Performance</Text>
            <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4 mt-2">
              <View className="flex-row justify-between mb-4">
                <Text className="text-base font-semibold text-gray-900">
                  Portfolio Summary
                </Text>
                <TouchableOpacity
                  onPress={() => console.log("View detailed performance")}
                >
                  <Feather name="external-link" size={18} color="#10B981" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Total Invested</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {cur.symbol}{" "}
                    {portfolioTotals.totalInvested.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Total Returns</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      portfolioTotals.totalReturns >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {portfolioTotals.totalReturns >= 0 ? "+" : ""}
                    {cur.symbol} {portfolioTotals.totalReturns.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Monthly Income</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {cur.symbol}{" "}
                    {portfolioTotals.monthlyIncome.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Average Yield</Text>
                  <Text className="text-sm font-semibold text-green-600">
                    {portfolioTotals.averageYield.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </Card>
          </>
        )}

        <Text className="ml-5 text-xl font-semibold my-4">
          Learn about our security
        </Text>

        <AcademyVideoCard />

        <View className="mb-4" />

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
              title: "How does AMF protect user Money?",
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
      </ScrollView>
    </View>
  );
};

export default PortfolioScreen;
