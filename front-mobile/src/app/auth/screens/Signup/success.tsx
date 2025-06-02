import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SolidButton } from "@auth/components/ui";

const CheckIcon = require("@assets/OTP.png"); // Using OTP icon as placeholder

export default function SignupSuccessScreen() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to login screen
    router.replace("/auth/screens/Login/login");
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">
      <View className="w-full max-w-md">
        {/* Success Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Image
              source={CheckIcon}
              style={{ width: 48, height: 48, tintColor: "#10B981" }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Account Created Successfully! 🎉
          </Text>

          <Text className="text-gray-500 text-center text-lg leading-6">
            Welcome to Korpor! Your account has been created and verified. You
            can now start investing in real estate opportunities.
          </Text>
        </View>

        {/* Success Details */}
        <View className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-green-600 text-xs font-bold">✓</Text>
            </View>
            <Text className="text-gray-700 font-medium">Email verified</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-green-600 text-xs font-bold">✓</Text>
            </View>
            <Text className="text-gray-700 font-medium">
              Phone number verified
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-green-600 text-xs font-bold">✓</Text>
            </View>
            <Text className="text-gray-700 font-medium">Account activated</Text>
          </View>
        </View>

        {/* Continue Button */}
        <SolidButton title="Continue to Login" onPress={handleContinue} />

        <Text className="text-center text-gray-500 text-sm mt-6">
          You can now sign in with your email and password to start exploring
          investment opportunities.
        </Text>
      </View>
    </View>
  );
}
