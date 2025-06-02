import { View, Text, Image, TouchableOpacity } from "react-native";
import { OTPCard } from "@auth/components/complex";
import { useLocalSearchParams, useRouter } from "expo-router";

const BackButton = require("@assets/back.png");
const OTP = require("@assets/OTP.png");

export default function VerificationScreen() {
  const router = useRouter();
  // Email and userId are required to verify
  const { email, userId } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-50">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        className="mt-2"
      >
        <Image source={BackButton} className="h-12 w-12" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center">
        <Image
          source={OTP}
          style={{ width: 120, height: 120, resizeMode: "contain" }}
          className="mb-4 mt-[-40%]"
        />
        <OTPCard email={email as string} userId={userId as string} />
      </View>
    </View>
  );
}
