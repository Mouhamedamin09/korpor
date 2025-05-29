// screens/main/components/profileScreens/profile/CurrencyScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { TopBar } from "@main/components/profileScreens/components/ui";
import Feather from "react-native-vector-icons/Feather";
import CountryFlag from "react-native-country-flag";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  fetchAccountData,
  fetchUserSettings,
  updateCurrency,
} from "@main/services/api";

const PulseBlock = ({
  height,
  width = "100%",
  radius = 8,
  className = "",
}: {
  height: number | string;
  width?: number | string;
  radius?: number;
  className?: string;
}) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{ type: "timing", duration: 700, loop: true }}
    className={`bg-gray-300 ${className}`}
    style={{ height, width, borderRadius: radius }}
  />
);

const CurrencyRowSkeleton = () => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{ type: "timing", duration: 700, loop: true }}
    className="bg-surface p-4 rounded-xl border border-border shadow-sm mb-4"
  >
    <View className="flex-row items-center">
      <View className="w-6 h-6 rounded-full bg-gray-300" />
      <View className="ml-3 flex-1">
        <PulseBlock height={16} width={60} radius={4} className="mb-2" />
        <PulseBlock height={12} width="60%" radius={4} />
      </View>
    </View>
  </MotiView>
);

const CurrencyScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<"USD" | "EUR" | "TND" | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { email: e } = await fetchAccountData();
      setEmail(e);
      const { currency } = await fetchUserSettings(e);
      setSelected(currency);
      setLoading(false);
    })();
  }, []);

  const currencies = [
    { code: "USD", flag: "US", name: "United States Dollar ($)" },
    { code: "EUR", flag: "FR", name: "Euro (€)" },
    { code: "TND", flag: "TN", name: "Tunisian Dinar (TND)" },
  ] as const;

  const choose = async (code: "USD" | "EUR" | "TND") => {
    if (loading || !email) return;
    await updateCurrency(email, code);
    setSelected(code);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <TopBar title="Select Currency" onBackPress={() => router.back()} />

      <View className="px-4 py-6">
        {loading
          ? currencies.map((c) => <CurrencyRowSkeleton key={c.code} />)
          : currencies.map((c) => (
              <TouchableOpacity
                key={c.code}
                onPress={() => choose(c.code)}
                activeOpacity={0.8}
                className={`flex-row items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-sm mb-4 ${
                  selected === c.code ? "border-primary" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <CountryFlag isoCode={c.flag} size={24} />
                  <View className="ml-3">
                    <Text className="text-base font-medium text-surfaceText">
                      {c.code}
                    </Text>
                    <Text className="text-sm text-mutedText">{c.name}</Text>
                  </View>
                </View>
                {selected === c.code && (
                  <Feather name="check" size={20} color="#000" />
                )}
              </TouchableOpacity>
            ))}

        {loading ? (
          <PulseBlock height={48} width="100%" radius={8} />
        ) : (
          <Text className="text-sm text-textGray mt-4">
            Properties are listed and purchased in TND (Tunisian Dinar). Use
            this setting to approximate property value in local currencies.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default CurrencyScreen;
