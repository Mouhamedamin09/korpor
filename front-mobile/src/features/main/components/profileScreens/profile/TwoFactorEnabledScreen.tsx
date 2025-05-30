// app/screens/main/components/profileScreens/profile/TwoFactorEnabledScreen.tsx

import React from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { TopBar } from "@main/components/profileScreens/components/ui";

export default function TwoFactorEnabledScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <TopBar
        title="Check your authenticator"
        onBackPress={() =>
          router.replace(
            "/main/components/profileScreens/profile/MultiFactorAuthScreen"
          )
        }
      />

      <View className="flex-1 items-center justify-center px-6">
        {/* 80% larger than 48x48 → ~86x86 */}
        <Image
          source={require("@assets/checkmark.png")}
          style={{ width: 86, height: 86 }}
        />

        <Text className="text-lg font-semibold text-gray-900 text-center mt-6 mb-4">
          Multi-factor authentication is now on!
        </Text>
        <Text className="text-sm text-gray-600 text-center px-4">
          Each time you access Korpor, you’ll be asked to enter a one-time code
          in addition to your password to confirm it’s you.
        </Text>
      </View>
    </View>
  );
}
