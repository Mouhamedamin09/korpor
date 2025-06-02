import { View, Text, Image } from "react-native";
import { SignupCard } from "@auth/components/complex";
import { useRouter } from "expo-router";
const Logo = require("@assets/korporBlack.png");
export default function Signup() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center">
        <Image
          source={Logo}
          style={{ resizeMode: "contain" }}
          className="w-28 h-28"
        />
        {/* Renders the sign up form for personal details */}
        <SignupCard />
      </View>
    </View>
  );
}
