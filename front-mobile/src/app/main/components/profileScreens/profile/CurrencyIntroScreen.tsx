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
      <View className="items-center p-6 mb-4">
        <View className="w-16 h-16 bg-black rounded-full items-center justify-center mb-4">
          <Feather name="dollar-sign" size={32} color="white" />
        </View>
        <Text className="text-xl font-bold text-surfaceText text-center">
          Choose Your Display Currency
        </Text>
      </View>

      <View className="px-4">
        <Card extraStyle="border-border p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="globe" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-surfaceText">
              Korpor functions in TND
            </Text>
          </View>
          <Text className="text-sm text-mutedText">
            We hold your money securely and process all transactions in Tunisian
            Dinar (TND).
          </Text>
        </Card>

        <Card extraStyle="border-border p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="info" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-surfaceText">
              Display currency is approximate
            </Text>
          </View>
          <Text className="text-sm text-mutedText">
            The value shown is an estimated conversion for reference purposes.
          </Text>
        </Card>

        <Card extraStyle="border-border p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="home" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-surfaceText">
              Properties priced in TND
            </Text>
          </View>
          <Text className="text-sm text-mutedText">
            Use this setting to view the approximate value of your properties in
            local currency.
          </Text>
        </Card>
      </View>

      <View className="px-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-xl p-4 items-center justify-center"
        >
          <Text className="text-primaryText font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CurrencyIntroScreen;
