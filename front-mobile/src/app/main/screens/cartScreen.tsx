import { View, Text } from "react-native";
import { CartHeader, CartItem } from "../components/complex";
export default function CartScreen() {
  return (
    <View className="bg-primary-foreground">
      <CartHeader />
      <CartItem />
    </View>
  );
}
