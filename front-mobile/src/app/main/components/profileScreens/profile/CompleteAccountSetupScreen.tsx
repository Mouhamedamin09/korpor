// screens/main/components/profileScreens/profile/CompleteAccountSetupScreen.tsx
import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import Feather from "react-native-vector-icons/Feather";

const CompleteAccountSetupScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <TopBar
        title="Complete account setup"
        onBackPress={() => router.back()}
      />

      <View className="pt-4 px-4">
        <Card>
          <Text className="text-lg font-bold text-surfaceText">
            Regulations require us to verify your information before you can
            invest.
          </Text>
        </Card>

        <Card>
          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000000" />
            <View className="ml-3">
              <Text className="text-sm text-mutedText">Step 1</Text>
              <Text className="text-base font-semibold text-surfaceText">
                Account created
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000000" />
            <View className="ml-3">
              <Text className="text-sm text-mutedText">Step 2</Text>
              <Text className="text-base font-semibold text-surfaceText">
                Tell us about your employment
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <Feather name="clock" size={24} color="#000000" />
            <View className="ml-3">
              <Text className="text-sm text-mutedText">Step 3</Text>
              <Text className="text-base font-semibold text-surfaceText">
                Verify your identity
              </Text>
              <Text className="text-sm text-mutedText">2 mins</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Feather name="clock" size={24} color="#000000" />
            <View className="ml-3">
              <Text className="text-sm text-mutedText">Step 4</Text>
              <Text className="text-base font-semibold text-surfaceText">
                Verify your address
              </Text>
              <Text className="text-sm text-mutedText">2 mins</Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity
          onPress={() =>
            router.push(
              "main/components/profileScreens/profile/UploadPassportScreen"
            )
          }
          className="mt-6 bg-primary rounded-xl p-4 items-center justify-center shadow-lg"
        >
          <Text className="text-base font-bold text-primaryText">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-3 bg-surface border-2 border-border rounded-xl p-4 items-center justify-center shadow-lg"
        >
          <Text className="text-base font-bold text-surfaceText">
            Do this later
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CompleteAccountSetupScreen;
