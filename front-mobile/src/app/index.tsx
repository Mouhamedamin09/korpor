import { Text, View, Image } from "react-native";
import "../../global.css";
import OutlinedButton from "@auth/components/ui/outlinedButton";
import SolidButtonLg from "@auth/components/ui/solidButtonLg";
import { router } from "expo-router";
const logo = require("@assets/logo.png");

export default function App() {
  return (
    <View className="flex-1 bg-[#09090b] justify-between items-center">
      <View className="items-center">
        <Image
          style={{ resizeMode: "contain" }}
          source={logo}
          className="w-40 h-40 mb-10 mt-[20%]"
        />
        <Text className="text-6xl font-bold text-white">
          Welcome to Korpor!
        </Text>
      </View>
      <View className="w-[90%]">
        <SolidButtonLg
          title="main app(temp)"
          onPress={() => {
            router.push("main/screens/(tabs)/properties");
          }}
        />
        <View className="mt-3" />
        <SolidButtonLg
          title="Signup"
          onPress={() => {
            router.push("auth/screens/Signup");
          }}
        />
        <View className="mt-3" />
        <OutlinedButton
          title="Login"
          onPress={() => {
            router.push("auth/screens/Login");
          }}
        />
        <View className="mt-3" />
      </View>
    </View>
  );
}
