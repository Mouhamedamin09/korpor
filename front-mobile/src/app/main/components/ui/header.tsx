import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

export default function Header() {
  return (
    <View className="flex">
      <View className="items-center flex-row justify-between pr-3 pl-1">
        <TouchableOpacity className="p-2" onPress={() => router.back()}>
          <Feather name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => console.log("issue pressed")}>
            <Feather name="alert-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full h-0.5 bg-[#f1f1f3]" />
    </View>
  );
}
