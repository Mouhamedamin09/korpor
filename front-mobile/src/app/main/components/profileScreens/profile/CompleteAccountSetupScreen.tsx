// ../../screens/main/components/profileScreens/profile/CompleteAccountSetupScreen.tsx
import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // ★ NEW: navigation
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import Feather from "react-native-vector-icons/Feather";

const CompleteAccountSetupScreen: React.FC = () => {
  const router = useRouter(); // ★ NEW

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Top Bar */}
      <TopBar
        title="Complete account setup"
        onBackPress={() => router.back()} // ★ FIX: real back
      />

      <View className="pt-4 px-4">
        {/* Intro */}
        <Card>
          <Text className="text-lg font-bold text-gray-900">
            Regulations require us to verify your information before you can
            invest.
          </Text>
        </Card>

        {/* Steps */}
        <Card>
          {/* Step 1 */}
          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">Step 1</Text>
              <Text className="text-base font-semibold text-gray-900">
                Account created
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">Step 2</Text>
              <Text className="text-base font-semibold text-gray-900">
                Tell us about your employment
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View className="flex-row items-center mb-4">
            <Feather name="clock" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">Step 3</Text>
              <Text className="text-base font-semibold text-gray-900">
                Verify your identity
              </Text>
              <Text className="text-sm text-gray-500">2 mins</Text>
            </View>
          </View>

          {/* Step 4 */}
          <View className="flex-row items-center">
            <Feather name="clock" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">Step 4</Text>
              <Text className="text-base font-semibold text-gray-900">
                Verify your address
              </Text>
              <Text className="text-sm text-gray-500">2 mins</Text>
            </View>
          </View>
        </Card>

        {/* Continue */}
        <TouchableOpacity
          onPress={() =>
            router.push(
              "main/components/profileScreens/profile/UploadPassportScreen"
            )
          }
          className="mt-6 bg-black rounded-xl p-4 items-center justify-center shadow-lg"
        >
          <Text className="text-base font-bold text-white">Continue</Text>
        </TouchableOpacity>

        {/* Do this later */}
        <TouchableOpacity
          onPress={() => router.back()} // ★ NEW
          className="mt-3 bg-white border-2 border-black rounded-xl p-4 items-center justify-center shadow-lg"
        >
          <Text className="text-base font-bold text-black">Do this later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CompleteAccountSetupScreen;
