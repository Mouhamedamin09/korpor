import { View, Text, Image } from "react-native";

import { LoginCard } from "@auth/components/complex/index";

const Logo = require("@assets/korporBlack.png");
export default function Login() {
  return (
    <View className="flex-1 bg-[#f8f4f4]">
      <View className="flex-1 justify-center items-center">
        <Image
          source={Logo}
          style={{ resizeMode: "contain" }}
          className="w-28 h-28"
        />
        <LoginCard />
      </View>
    </View>
  );
}
