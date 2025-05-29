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
} from "@main/services/portfolio";

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
  const [totals, setTotals] = useState({ usd: 0, local: 0 });
  const [automation, setAutomation] = useState({
    autoInvestSetup: false,
    autoReinvestSetup: false,
  });
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const loadPortfolioData = useCallback(async () => {
    setLoadingPortfolio(true);
    try {
      const [tot, auto] = await Promise.all([
        fetchPortfolioTotals(),
        fetchAutomationStatus(),
      ]);
      setTotals(tot);
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
          usdValue={totals.usd}
          localCurrencyCode={cur.code}
          localValue={totals.local}
          loading={loadingPortfolio}
        />

        <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
          {/* existing “Start earning” block (unchanged) */}
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

          <TouchableOpacity className="flex-row items-center mt-4 pt-4 border-t border-gray-200">
            <Text className="text-base font-semibold text-green-700 flex-1">
              Learn more about Stake
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
              onPress: () => console.log("open article 1"),
            },
            {
              icon: "shield",
              title: "How does DFSA\nprotect my money?",
              read: false,
              onPress: () => console.log("open article 2"),
            },
            {
              icon: "user",
              title: "How does DFSA protect user Money?",
              read: false,
              onPress: () => console.log("open article 3"),
            },
            {
              icon: "lock",
              title: "How does Korpor protect my data?",
              read: false,
              onPress: () => console.log("open article 4"),
            },
            {
              icon: "info",
              title: "What is DIFC?",
              read: false,
              onPress: () => console.log("open article 5"),
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
