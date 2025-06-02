import { View, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PhoneOTPCard from "@auth/components/complex/PhoneOTPCard";

const BackButton = require("@assets/back.png");
const OTP = require("@assets/OTP.png");

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

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
          style={{ width: 90, height: 90, resizeMode: "contain" }}
          className="mb-4 mt-[-40%]"
        />
        <PhoneOTPCard userId={userId as string} />
      </View>
    </View>
  );
}
