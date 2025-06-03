import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { DropdownMenu, NotificationBell } from "../ui/index";
import { PropertyCategory } from "@/app/main/services/propertyUtils";
import BottomSheet from "../profileScreens/components/ui/SheetIndicator";

const Logo = require("@assets/korporBlack.png");

interface Props {
  selectedCategory: PropertyCategory;
  onChangeCategory: (c: PropertyCategory) => void;
}

export default function TopMenu({ selectedCategory, onChangeCategory }: Props) {
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);

  const handleNotificationPress = () => {
    setShowNotificationSheet(true);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View className="mx-4 flex-row items-center h-16">
          <Image
            source={Logo}
            className="w-24 h-24"
            style={{ resizeMode: "contain" }}
          />
        </View>

        <View className="ml-2 flex-row">
          <DropdownMenu
            selected={selectedCategory}
            onChange={onChangeCategory}
          />

          <View className="flex-row items-center ml-auto mr-6">
            <View className="w-3" />
            <NotificationBell onPress={handleNotificationPress} />
          </View>
        </View>

        <View className="w-full h-0.5 bg-[#f1f1f3] mt-3" />

        <BottomSheet
          visible={showNotificationSheet}
          onClose={() => setShowNotificationSheet(false)}
        >
          <View className="py-4">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Notifications & Actions
            </Text>

            <View className="space-y-4">
              <View className="bg-blue-50 p-4 rounded-lg">
                <Text className="font-semibold text-blue-800 mb-2">
                  📊 Investment Updates
                </Text>
                <Text className="text-blue-700">
                  Get notified about your investment progress, dividend
                  payments, and portfolio performance.
                </Text>
              </View>

              <View className="bg-green-50 p-4 rounded-lg">
                <Text className="font-semibold text-green-800 mb-2">
                  🏠 New Properties
                </Text>
                <Text className="text-green-700">
                  Be the first to know when new investment opportunities become
                  available.
                </Text>
              </View>

              <View className="bg-orange-50 p-4 rounded-lg">
                <Text className="font-semibold text-orange-800 mb-2">
                  ⚡ Quick Actions
                </Text>
                <Text className="text-orange-700">
                  Access your cart, saved properties, and recent activities from
                  the top menu icons.
                </Text>
              </View>

              <View className="bg-purple-50 p-4 rounded-lg">
                <Text className="font-semibold text-purple-800 mb-2">
                  📈 Market Insights
                </Text>
                <Text className="text-purple-700">
                  Receive market updates and investment tips to maximize your
                  returns.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowNotificationSheet(false)}
              className="bg-green-600 py-3 rounded-lg mt-6"
            >
              <Text className="text-white font-semibold text-center">
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: "#fff",
    paddingTop: 0,
  },
  container: {
    zIndex: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f3",
  },
});
