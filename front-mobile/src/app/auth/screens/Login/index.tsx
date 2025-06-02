import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LoginCard } from "@auth/components/complex/index";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Logo = require("@assets/korporBlack.png");

export default function Login() {
  const router = useRouter();

  const handleGoBack = () => {
    router.replace("/"); // Go back to the main screen with signup/login buttons
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f4f4]">
      {/* Back Button Header */}
      <View className="flex-row items-center justify-start px-4 py-3">
        <TouchableOpacity
          onPress={handleGoBack}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="text-gray-700 text-base ml-2 font-medium">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-4">
        <Image
          source={Logo}
          style={{ resizeMode: "contain" }}
          className="w-28 h-28 mb-6"
        />
        <LoginCard />
      </View>
    </SafeAreaView>
  );
}
