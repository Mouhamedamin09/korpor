import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
const Back = require("@assets/angle-left.png");
const BookmarkOff = require("@assets/bookmark-off.png");
const BookmarkOn = require("@assets/bookmark-on.png");
const Share = require("@assets/share.png");
const Issue = require("@assets/issue-loupe.png");

export default function Header() {
  return (
    <View className="flex">
      <View className="h-14 items-center flex-row justify-between pr-3 pl-1">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Image source={Back} className="w-8 h-8" />
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => {
              console.log("issue pressed");
            }}
          >
            <Image source={Issue} className="w-6 h-6" />
          </TouchableOpacity>
          <View className="w-4" />
          <TouchableOpacity
            onPress={() => {
              console.log("bookmark pressed");
            }}
          >
            <Image source={BookmarkOff} className="w-6 h-6" />
          </TouchableOpacity>
          <View className="w-4" />
          <TouchableOpacity
            onPress={() => {
              console.log("share pressed");
            }}
          >
            <Image source={Share} className="w-6 h-6" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full h-0.5 bg-[#f1f1f3]" />
    </View>
  );
}
