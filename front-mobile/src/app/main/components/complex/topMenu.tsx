import React from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import {
  DropdownMenu,
  Bookmarks,
  NotificationBell,
  ShoppingCart,
} from "../ui/index";

interface TopMenuProps {
  translateY: Animated.Value;
}

export default function TopMenu({ translateY }: TopMenuProps) {
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View className="mx-4 mt-2 flex-row items-center">
        <Text className="text-2xl font-semibold">Korpor</Text>
      </View>
      <View className="mt-2 ml-2 flex-row">
        <DropdownMenu />
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
