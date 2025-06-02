import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { SignupCard } from "@auth/components/complex";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Logo = require("@assets/korporBlack.png");

export default function Signup() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Back Button Header */}

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-4">
        <Image
          source={Logo}
          className="w-28 h-28 mb-6"
          style={{ resizeMode: "contain" }}
        />

        <SignupCard />
      </View>
    </SafeAreaView>
  );
}
