// ../../screens/LanguageScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

const LanguageScreen: React.FC = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const languages = ["English", "French", "Arabic"];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <TopBar title="Select Language" onBackPress={() => router.back()} />
      <View className="px-4 py-6">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => {
              setSelectedLanguage(lang);
              router.back();
            }}
            className={`flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 ${
              selectedLanguage === lang ? "border-blue-500" : ""
            }`}
          >
            <Text className="text-base font-medium text-gray-900">{lang}</Text>
            {selectedLanguage === lang && (
              <Feather name="check" size={20} color="blue" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default LanguageScreen;
