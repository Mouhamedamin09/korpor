// ../../screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView as RNScrollView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import { fetchAccountData, AccountData } from "@main/services/api";
import { getInitials } from "@main/components/profileScreens/components/ui/string"; // 📌 same helper used in AccountScreen

const ProfileScreen: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [account, setAccount] = useState<AccountData | null>(null);

  // ────────────────────────────────────────────────
  // Fetch the same account data used in AccountScreen
  // ────────────────────────────────────────────────
  useEffect(() => {
    fetchAccountData().then(setAccount).catch(console.error);
  }, []);

  // Unified initials logic
  const initials = account ? getInitials(account.name) : "MK";

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // ─────────────── Skeleton Loader (unchanged) ───────────────
  const SkeletonProfile = () => (
    <View>
      {/* Skeleton Top Bar */}
      <View className="bg-gray-300 flex-row items-center justify-between px-4 py-4 shadow">
        <View
          style={{
            width: 100,
            height: 24,
            backgroundColor: "#e2e8f0",
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 80,
            height: 24,
            backgroundColor: "#e2e8f0",
            borderRadius: 4,
          }}
        />
      </View>

      {/* ... rest of skeleton loader unchanged ... */}
    </View>
  );

  // ────────────────────────────────
  // Main render
  // ────────────────────────────────
  return (
    <ScrollView
      stickyHeaderIndices={[1]}
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {isRefreshing ? (
        <SkeletonProfile />
      ) : (
        <>
          {/* Top Bar */}
          <View className="bg-white flex-row items-center justify-between px-4 py-4 shadow">
            <Text className="text-xl font-bold text-black">Profile</Text>
            <TouchableOpacity onPress={() => console.log("Korpor clicked")}>
              <Text className="text-xl font-bold text-black">Korpor</Text>
            </TouchableOpacity>
          </View>

          {/* Pinned Profile Card */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                "main/components/profileScreens/profile/AccountDetails"
              )
            }
            className="bg-white px-4 py-4 shadow"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-green-200">
                <Text className="text-lg font-bold text-black">{initials}</Text>
              </View>
              <View>
                <TouchableOpacity onPress={() => console.log("Name clicked")}>
                  <Text className="text-base font-semibold text-black">
                    {account?.name || "Loading…"}
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-600">
                  Your account and details
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={24}
                color="black"
                className="ml-auto"
              />
            </View>
          </TouchableOpacity>

          {/* Main content */}
          <View className="mt-6 px-4">
            {/* KYC Progress */}
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "main/components/profileScreens/profile/CompleteAccountSetupScreen"
                )
              }
              className="mb-6 flex-row items-center rounded-lg bg-white p-4 shadow"
            >
              <Feather
                name="check-circle"
                size={24}
                color="black"
                className="mr-3"
              />
              <View className="flex-1">
                <Text className="mb-1 text-base font-semibold text-black">
                  Verify your account to start investing
                </Text>
                <Text className="text-sm text-gray-600">2/5</Text>
              </View>
              <Feather name="chevron-right" size={24} color="black" />
            </TouchableOpacity>

            {/* Learn About Investing */}
            <View className="mb-8">
              <Text className="mb-4 text-base font-semibold text-black">
                Learn about investing
              </Text>
              <RNScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "main/components/profileScreens/profile/LearnHelp"
                    )
                  }
                  className="mr-4 w-60 flex-shrink-0 rounded-lg bg-green-100 p-4 shadow"
                >
                  <Text className="mb-2 text-sm font-semibold text-black">
                    How do I make money on Korpor?
                  </Text>
                  <Feather name="arrow-right" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => console.log("Receive documents clicked")}
                  className="w-60 flex-shrink-0 rounded-lg bg-green-100 p-4 shadow"
                >
                  <Text className="mb-2 text-sm font-semibold text-black">
                    When will I receive my documents?
                  </Text>
                  <Feather name="arrow-right" size={20} color="black" />
                </TouchableOpacity>
              </RNScrollView>
            </View>

            {/* Settings Section */}
            <View className="mb-8">
              <Text className="mb-4 text-base font-semibold text-black">
                Settings
              </Text>

              {[
                {
                  label: "About Korpor",
                  icon: "info",
                  action: () => console.log("About Korpor"),
                },
                {
                  label: "Help Center",
                  icon: "help-circle",
                  action: () =>
                    router.push(
                      "main/components/profileScreens/profile/GetHelpScreen"
                    ),
                },
                {
                  label: "Notifications",
                  icon: "bell",
                  action: () => console.log("Notifications"),
                },
                {
                  label: "Refer a Friend",
                  icon: "users",
                  action: () => console.log("Refer a Friend"),
                },
                {
                  label: "Feedback Survey",
                  icon: "edit",
                  action: () => console.log("Feedback Survey"),
                },
                {
                  label: "Calculate My Potential",
                  icon: "trending-up",
                  action: () => console.log("Calculate Potential"),
                },
                {
                  label: "Settings",
                  icon: "settings",
                  action: () =>
                    router.push(
                      "main/components/profileScreens/profile/settings"
                    ),
                },
              ].map(({ label, icon, action }, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={action}
                  className="mb-3 flex-row items-center rounded-lg bg-white p-4 shadow"
                >
                  <Feather
                    name={icon as any}
                    size={20}
                    color="black"
                    className="mr-3"
                  />
                  <Text className="flex-1 text-sm text-black">{label}</Text>
                  <Feather name="chevron-right" size={20} color="black" />
                </TouchableOpacity>
              ))}

              {/* Security & Privacy Section */}
              <Text className="mt-6 mb-4 text-base font-semibold text-black">
                Security & Privacy
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "main/components/profileScreens/profile/SecurityPrivacyScreen"
                  )
                }
                className="mb-3 flex-row items-center rounded-lg bg-white p-4 shadow"
              >
                <Feather name="lock" size={20} color="black" className="mr-3" />
                <Text className="flex-1 text-sm text-black">
                  Security & Privacy
                </Text>
                <Feather name="chevron-right" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Social Icons */}
            <View className="mb-8 flex-row items-center justify-center">
              {["facebook", "twitter", "instagram"].map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => console.log(`${icon} clicked`)}
                  className="h-10 w-10 items-center justify-center rounded-full border border-gray-300 mx-4"
                >
                  <Feather name={icon as any} size={20} color="black" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={() => console.log("Logout clicked")}
              className="mb-6 rounded bg-black px-4 py-3"
            >
              <Text className="text-center text-sm font-medium text-white">
                Logout
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="mb-10 items-center">
              <View className="mb-2 h-16 w-16 items-center justify-center bg-black rounded-full">
                <Image
                  source={require("@assets/logo.png")}
                  style={{ width: 32, height: 32, tintColor: "white" }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-xs text-gray-600 text-center">
                Korpor is a real estate investing app. All rights reserved ©{" "}
                {currentYear}
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
