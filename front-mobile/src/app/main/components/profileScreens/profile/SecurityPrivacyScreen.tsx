// ../../screens/SecurityPrivacyScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

const SecurityPrivacyScreen: React.FC = () => {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  const handleToggleBiometric = () => {
    setIsBiometricEnabled((prev) => !prev);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <TopBar title="Security & Privacy" onBackPress={() => router.back()} />

      <View className="px-4 pb-4">
        <Text className="text-lg font-bold text-gray-700 mb-2">Security</Text>

        <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Feather name="lock" size={20} color="black" className="mr-4" />
              <Text className="text-base font-medium text-gray-900">
                Biometric authentication
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "#10B981" }}
              thumbColor={isBiometricEnabled ? "#ffffff" : "#ffffff"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={handleToggleBiometric}
              value={isBiometricEnabled}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Enable for added security and streamline your login process.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => console.log("Multi-factor authentication pressed")}
          className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
        >
          <View className="flex-row items-center">
            <Feather name="shield" size={20} color="black" className="mr-4" />
            <Text className="text-base font-medium text-gray-900">
              Multi-factor authentication
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log("Social logins pressed")}
          className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
        >
          <View className="flex-row items-center">
            <Feather name="user" size={20} color="black" className="mr-4" />
            <Text className="text-base font-medium text-gray-900">
              Social logins
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="black" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-700 mb-2">Privacy</Text>

        <TouchableOpacity
          onPress={() => console.log("Privacy policy pressed")}
          className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
        >
          <View className="flex-row items-center">
            <Feather
              name="file-text"
              size={20}
              color="black"
              className="mr-4"
            />
            <Text className="text-base font-medium text-gray-900">
              Privacy policy
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SecurityPrivacyScreen;
