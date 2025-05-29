import { Text, View, Image } from "react-native";
import "../../global.css";
import { OutlinedButton, SolidButtonLg } from "@auth/components/ui/index";
import { router } from "expo-router";
const logo = require("@assets/logo-black.png");
const Slogan = require("@assets/korporBlack.png");
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@assets/fonts/poppins/Poppins-SemiBold.ttf"),
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <View className="flex-1 bg-background justify-between items-center">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View className="flex-1">
        <View className="my-auto pb-80">
          <Image
            style={{ resizeMode: "contain" }}
            source={logo}
            className="w-36 h-36 self-center"
          />
          <Text className="text-6xl font-semibold text-text font-Poppins">
            Welcome to Korpor!
          </Text>
        </View>
      </View>
      <View className="w-[90%]">
        <SolidButtonLg
          title="main app(temp)"
          onPress={() => {
            router.push("main/screens/properties");
          }}
        />
        <SolidButtonLg
          title="Signup"
          onPress={() => {
            router.push("auth/screens/Signup");
          }}
        />
        <View className="mt-2" />
        <OutlinedButton
          title="Login"
          onPress={() => {
            router.push("auth/screens/Login");
          }}
        />
        <View className="mt-5" />
      </View>
    </View>
  );
}
