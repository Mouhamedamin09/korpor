// screens/main/components/wallet/PortfolioScreen.tsx

import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import CountryFlag from "react-native-country-flag";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import PortfolioValueCard from "@main/components/portfolio/components/ui/PortfolioValueCard";
import Card from "@main/components/profileScreens/components/ui/card";
import QuickstartCard from "@/app/main/components/portfolio/components/ui/QuickstartCard";

const { width } = Dimensions.get("window");

const PortfolioScreen: React.FC = () => {
  const router = useRouter();

  // dummy totals until your API is wired up
  const usdTotal = 0;
  const aedTotal = 0;
  const cur = { code: "TND", flag: "TN" };

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

      <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingTop: 32 }}>
        <PortfolioValueCard
          usdValue={usdTotal}
          localCurrencyCode={cur.code}
          localValue={aedTotal}
        />

        <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
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
            {
              icon: "award",
              txt: "Receive legal ownership documents",
            },
            {
              icon: "dollar-sign",
              txt: "Receive rental payments every month",
            },
            {
              icon: "arrow-up",
              txt: "Earn property appreciation over time",
            },
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
        {/* —————————————————————————————
             END CARD
           ————————————————————————————— */}
        <QuickstartCard />
        {/* …other sections here… */}
      </ScrollView>
    </View>
  );
};

export default PortfolioScreen;
