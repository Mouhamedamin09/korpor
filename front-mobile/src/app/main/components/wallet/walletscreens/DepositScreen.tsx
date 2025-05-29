// screens/main/components/wallet/DepositScreen.tsx

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";

const MIN_DEPOSIT = 5.0;

type Method = {
  id: string;
  label: string;
};

const METHODS: Method[] = [
  { id: "card", label: "Credit/Debit Card" },
  { id: "bank", label: "Bank Transfer" },
];

const DepositScreen: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>(METHODS[0].id);

  const numAmount = parseFloat(amount) || 0;
  const valid = numAmount >= MIN_DEPOSIT && selectedMethod;

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Deposit" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        >
          {/* ── Amount Input ─────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Enter amount to deposit
            </Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2">
              <Text className="text-lg text-gray-600 mr-1">$</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                className="flex-1 text-lg text-gray-900"
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Minimum deposit is ${MIN_DEPOSIT.toFixed(2)}
            </Text>
          </Card>

          {/* ── Method Selection ───────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Payment Method
            </Text>

            {METHODS.map(({ id, label }) => {
              const isSelected = selectedMethod === id;

              return (
                <Pressable
                  key={id}
                  onPress={() => setSelectedMethod(id)}
                  android_ripple={{ color: "#d1fae5" }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  className={`flex-row items-center p-3 rounded-xl mb-2 ${
                    isSelected
                      ? "border-2 border-green-600 bg-green-50"
                      : "border border-gray-200"
                  }`}
                >
                  <Feather
                    name={isSelected ? "check-circle" : "circle"}
                    size={22}
                    color={isSelected ? "#10B981" : "#9CA3AF"}
                    className="mr-3"
                  />

                  <Text className="text-base text-gray-900">{label}</Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => router.push("addPaymentMethod")}
              android_ripple={{ color: "#e5e7eb" }}
              className="flex-row items-center pt-3 mt-1 border-t border-gray-100"
            >
              <Feather name="plus-circle" size={20} color="#374151" />
              <Text className="ml-2 text-sm font-medium text-gray-700">
                Add new method
              </Text>
            </Pressable>
          </Card>

          {/* ── Info Card ─────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Processing time</Text>
              <Text className="text-sm font-medium text-gray-900">
                Instant to 1 day
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Fees</Text>
              <Text className="text-sm font-medium text-gray-900">$ 0.00</Text>
            </View>
          </Card>

          {/* ── Confirm Button ───────────────────────────── */}
          <TouchableOpacity
            onPress={() =>
              valid &&
              router.push("confirmDeposit", {
                amount,
                method: selectedMethod,
              })
            }
            disabled={!valid}
            className={`mx-4 rounded-2xl py-4 items-center ${
              valid ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                valid ? "text-white" : "text-gray-600"
              }`}
            >
              Confirm Deposit
            </Text>
          </TouchableOpacity>

          {/* ── History Link ───────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.push("transactions?filter=deposits")}
            className="mt-6 mb-8 flex-row items-center justify-center"
          >
            <Feather name="clock" size={16} color="#374151" />
            <Text className="ml-2 text-sm font-medium text-gray-900">
              View deposit history
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DepositScreen;
