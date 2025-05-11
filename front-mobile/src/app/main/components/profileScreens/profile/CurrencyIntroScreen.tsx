import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import Card from "@main/components/profileScreens/components/ui/card";
import { fetchAccountData, setCurrencyIntroSeen } from "@main/services/api";

const CurrencyIntroScreen: React.FC = () => {
  const router = useRouter();

  const handleContinue = async () => {
    const { email } = await fetchAccountData();
    await setCurrencyIntroSeen(email);
    // replace INTRO with Currency chooser so stack = Profile > Settings > Currency
    router.replace("/main/components/profileScreens/profile/Currency");
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center p-6 mb-4">
        <View className="w-16 h-16 bg-black rounded-full items-center justify-center mb-4">
          <Feather name="dollar-sign" size={32} color="white" />
        </View>
        <Text className="text-xl font-bold text-black text-center">
          Choose Your Display Currency
        </Text>
      </View>

      <View className="px-4">
        {/* three cards (unchanged) */}
        <Card extraStyle="border-black p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="globe" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-black">
              Korpor functions in TND
            </Text>
          </View>
          <Text className="text-sm text-black">
            We hold your money securely and process all transactions in Tunisian
            Dinar (TND).
          </Text>
        </Card>

        <Card extraStyle="border-black p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="info" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-black">
              Display currency is approximate
            </Text>
          </View>
          <Text className="text-sm text-black">
            The value shown is an estimated conversion for reference purposes.
          </Text>
        </Card>

        <Card extraStyle="border-black p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Feather name="home" size={16} color="white" />
            </View>
            <Text className="text-base font-semibold text-black">
              Properties priced in TND
            </Text>
          </View>
          <Text className="text-sm text-black">
            Use this setting to view the approximate value of your properties in
            local currency.
          </Text>
        </Card>
      </View>

      <View className="px-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-black rounded-xl p-4 items-center justify-center"
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CurrencyIntroScreen;
