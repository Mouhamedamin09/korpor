// screens/main/components/profileScreens/profile/CurrencyIntroScreen.tsx
import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import { Card } from "@main/components/profileScreens/components/ui";
import { fetchAccountData, setCurrencyIntroSeen } from "@main/services/api";

const CurrencyIntroScreen: React.FC = () => {
  const router = useRouter();

  const handleContinue = async () => {
    const { email } = await fetchAccountData();
    await setCurrencyIntroSeen(email);
    router.replace("/main/components/profileScreens/profile/Currency");
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {/* header */}
      <View className="items-center p-8 mb-6">
        <View className="w-20 h-20 bg-green-100 rounded-2xl items-center justify-center mb-4">
          <Feather name="dollar-sign" size={36} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          Choose Your Display Currency
        </Text>
      </View>

      {/* info cards */}
      <View className="space-y-6">
        <Card extraStyle="bg-white rounded-2xl shadow-sm p-6 mx-4">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mr-3">
              <Feather name="globe" size={20} color="#fff" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Korpor functions in&nbsp;TND
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            We hold your money securely and process all transactions in Tunisian
            Dinar&nbsp;(TND).
          </Text>
        </Card>

        <Card extraStyle="bg-white rounded-2xl shadow-sm p-6 mx-4">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mr-3">
              <Feather name="info" size={20} color="#fff" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Display currency is approximate
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            The value shown is an estimated conversion for reference purposes.
          </Text>
        </Card>

        <Card extraStyle="bg-white rounded-2xl shadow-sm p-6 mx-4">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mr-3">
              <Feather name="home" size={20} color="#fff" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Properties priced in&nbsp;TND
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            Use this setting to view the approximate value of your properties in
            local currency.
          </Text>
        </Card>
      </View>

      {/* continue button */}
      <View className="px-4 mt-8 mb-12">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-[#000000] rounded-2xl py-4 items-center active:opacity-90"
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CurrencyIntroScreen;
// This code defines a CurrencyIntroScreen component that provides an introduction to currency selection in the app.
// It includes informational cards about the currency system and a button to proceed to the currency selection screen.
