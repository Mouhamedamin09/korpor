import { View, Text, SafeAreaView } from "react-native";
import { router } from "expo-router";
import TopBar from "@/app/main/components/profileScreens/components/ui/TopBar";
import { CartItem } from "../components/complex";

export default function CartScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-foreground">
      <TopBar title="Shopping Cart" onBackPress={() => router.back()} />
      <View className="flex-1">
        <CartItem />
      </View>
    </SafeAreaView>
  );
}
