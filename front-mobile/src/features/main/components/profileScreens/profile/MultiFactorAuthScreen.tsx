// screens/main/components/profileScreens/profile/MultiFactorAuthScreen.tsx

import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";

export default function MultiFactorAuthScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <TopBar
        title="Multi-factor authentication"
        onBackPress={() => router.back()}
      />

      <View className="px-4 py-4 space-y-4">
        {/* Authenticator app option */}
        <TouchableOpacity
          onPress={() =>
            router.push(
              "/main/components/profileScreens/profile/SetupAuthenticatorApp"
            )
          }
        >
          <Card extraStyle="flex-row items-center justify-between">
            <View className="flex-row items-start flex-1">
              <Feather name="lock" size={20} color="#000" className="mr-4" />
              <View className="flex-1">
                <Text className="text-base font-medium text-surfaceText">
                  Use an authenticator app
                </Text>
                <Text className="text-xs text-mutedText">
                  You will use an app (e.g. Google Authenticator) to generate
                  6-digit codes when you log in.
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#000" />
          </Card>
        </TouchableOpacity>

        {/* Phone number option */}
        <View className="opacity-40">
          <Card extraStyle="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Feather
                name="smartphone"
                size={20}
                color="#000"
                className="mr-4"
              />
              <View className="flex-1">
                <Text className="text-base font-medium text-surfaceText">
                  Use your phone number
                </Text>
                <Text className="text-xs text-mutedText">
                  This feature is only available to Korpor investors.
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#000" />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
