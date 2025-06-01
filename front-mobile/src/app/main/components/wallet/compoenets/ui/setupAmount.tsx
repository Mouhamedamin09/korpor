// components/AmountSetup.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useFocusEffect } from "expo-router";
import {
  fetchUserSettings,
  fetchAccountData,
  UserSettings,
} from "@main/services/api";

const { width } = Dimensions.get("window");
const NAVY = "#0A0E23";
const GREEN = "#10B981";
const quickAmounts = [2000, 5000, 15000];

// hard‐code or pull from your auth context
const USER_EMAIL = "mouhamedaminkraiem09@gmail.com";

interface Props {
  onNext: () => void;
}

const AmountSetup: React.FC<Props> = ({ onNext }) => {
  const [amount, setAmount] = useState<number>(2000);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "TND">("USD");
  const [userAccount, setUserAccount] = useState<any>(null);
  const router = useRouter();

  // Load initial account data
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const account = await fetchAccountData();
        setUserAccount(account);
        const settings = await fetchUserSettings(account.email);
        setCurrency(settings.currency);
      } catch (error) {
        console.error("Error loading account data:", error);
      }
    };
    loadAccount();
  }, []);

  // Refresh currency when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshCurrency = async () => {
        if (userAccount) {
          try {
            const settings = await fetchUserSettings(userAccount.email);
            setCurrency(settings.currency);
          } catch (error) {
            console.error("Error refreshing currency:", error);
          }
        }
      };
      refreshCurrency();
    }, [userAccount])
  );

  // 2) map code → symbol
  const symbolMap: Record<"USD" | "EUR" | "TND", string> = {
    USD: "$",
    EUR: "€",
    TND: "TND",
  };
  const symbol = symbolMap[currency];

  // 3) compute the "approx" exactly as before
  //    (you could swap in a real EUR‐rate if you like)
  const approxValue = Math.round(amount * 0.32).toLocaleString();

  return (
    <View className="flex-1 pt-6 px-4 items-center">
      {/* title */}
      <Text className="text-center text-3xl font-bold text-[#0A0E23] mb-6 leading-10 mt-40">
        How much do you want to{"\n"}invest monthly?
      </Text>

      {/* selector row */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="h-12 w-12 rounded-xl bg-black items-center justify-center mr-3"
          onPress={() => setAmount((p) => Math.max(0, p - 500))}
        >
          <Feather name="minus" size={20} color="#fff" />
        </TouchableOpacity>

        <View
          className="flex-1 flex-row items-center justify-between border border-gray-200 rounded-md py-4 px-4 bg-white"
          style={{ minWidth: width * 0.45 }}
        >
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-[#0A0E23] mr-2">
              {currency}
            </Text>
            <Text className="text-2xl font-bold text-[#0A0E23] ml-10">
              {amount.toLocaleString()}
            </Text>
          </View>

          {/* ← only this line changed */}
          <Text className="text-sm text-gray-500">
            {currency !== "USD"
              ? `~${symbol} ${approxValue}`
              : `${symbol} ${amount.toLocaleString()}`}
          </Text>
        </View>

        <TouchableOpacity
          className="h-12 w-12 rounded-xl bg-black items-center justify-center ml-3"
          onPress={() => setAmount((p) => p + 500)}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* subtitle */}
      <Text className="text-sm text-gray-500 text-center mt-4 mb-6 leading-5">
        We'll only take your deposit once you confirm your{"\n"}setup
      </Text>

      {/* quick-pick amounts */}
      <View className="flex-row mb-8">
        {quickAmounts.map((amt) => {
          const active = amt === amount;
          return (
            <Pressable
              key={amt}
              className={`py-2 px-4 rounded-full border mx-1 ${
                active
                  ? "border-[#10B981] bg-[#10B9811A]"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() => setAmount(amt)}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-[#10B981]" : "text-[#0A0E23]"
                }`}
              >
                {currency} {amt.toLocaleString()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* see potential income */}
      <TouchableOpacity
        className="flex-row items-center mb-10"
        onPress={() =>
          router.push(
            `/main/components/profileScreens/profile/PotentialIncomeScreen?deposit=${amount}`
          )
        }
      >
        <Feather name="calendar" size={18} color={GREEN} />
        <Text className="ml-2 text-base font-semibold text-[#10B981]">
          See how much you could earn
        </Text>
      </TouchableOpacity>

      {/* continue */}
      <TouchableOpacity
        className="w-full bg-black py-4 rounded-lg items-center mt-20"
        onPress={onNext}
      >
        <Text className="text-base font-bold text-white">
          Select your theme
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AmountSetup;
