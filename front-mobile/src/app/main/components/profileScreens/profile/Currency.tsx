// screens/main/components/profileScreens/profile/CurrencyScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { TopBar } from "@main/components/profileScreens/components/ui";
import Feather from "react-native-vector-icons/Feather";
import CountryFlag from "react-native-country-flag";
import { useRouter } from "expo-router";

import {
  fetchAccountData,
  fetchUserSettings,
  updateCurrency,
} from "@main/services/api";

const CurrencyScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<"USD" | "EUR" | "TND" | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchAccountData().then((u) => {
      setEmail(u.email);
      fetchUserSettings(u.email).then((s) => setSelected(s.currency));
    });
  }, []);

  const currencies = [
    { code: "USD", flag: "US", name: "United States Dollar ($)" },
    { code: "EUR", flag: "FR", name: "Euro (€)" },
    { code: "TND", flag: "TN", name: "Tunisian Dinar (TND)" },
  ];

  const choose = async (code: "USD" | "EUR" | "TND") => {
    if (!email) return;
    await updateCurrency(email, code);
    setSelected(code);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <TopBar title="Select Currency" onBackPress={() => router.back()} />

      <View className="px-4 py-6">
        {currencies.map((c) => (
          <TouchableOpacity
            key={c.code}
            onPress={() => choose(c.code)}
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
              <Feather name="check" size={20} color="#2b7fff" />
            )}
          </TouchableOpacity>
        ))}

        <Text className="text-sm text-textGray mt-4">
          Properties are listed and purchased in TND (Tunisian Dinar). Use this
          setting to approximate property value in local currencies.
        </Text>
      </View>
    </ScrollView>
  );
};

export default CurrencyScreen;
