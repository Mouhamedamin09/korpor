import React from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import {
  DropdownMenu,
  Bookmarks,
  NotificationBell,
  ShoppingCart,
} from "../ui/index";
import { PropertyCategory } from "@/app/main/services/propertyUtils";
const Logo = require("@assets/korporBlack.png");

interface Props {
  translateY: Animated.Value;
  selectedCategory: PropertyCategory;
  onChangeCategory: (c: PropertyCategory) => void;
}

export default function TopMenu({
  translateY,
  selectedCategory,
  onChangeCategory,
}: Props) {
  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View className="mx-4 flex-row items-center h-12">
        <Image
          source={Logo}
          className="w-20 h-20"
          style={{ resizeMode: "contain" }}
        />
      </View>

      <View className="ml-2 flex-row">
        <DropdownMenu selected={selectedCategory} onChange={onChangeCategory} />

        <View className="flex-row items-center ml-auto mr-6">
          <Bookmarks onPress={() => console.log("Bookmarks pressed")} />
          <View className="w-3" />
          <ShoppingCart onPress={() => console.log("Cart pressed")} />
          <View className="w-3" />
          <NotificationBell
            onPress={() => console.log("Notification pressed")}
          />
        </View>
      </View>

      <View className="w-full h-0.5 bg-[#f1f1f3] mt-2" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f3",
  },
});
