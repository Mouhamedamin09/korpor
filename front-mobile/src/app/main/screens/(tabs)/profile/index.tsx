// app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import { fetchAccountData, AccountData } from "@main/services/api";
import { getInitials } from "@main/components/profileScreens/components/ui/string";

type VerificationProgress = {
  completed: number;
  total: number;
};

interface ExtendedAccountData extends AccountData {
  verificationProgress?: VerificationProgress;
}

const PressableRow: React.FC<{
  onPress?: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => {
  if (!onPress) return <View className="mb-3">{children}</View>;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} className="mb-3">
      {children}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [account, setAccount] = useState<ExtendedAccountData | null>(null);

  useEffect(() => {
    fetchAccountData()
      .then((data) => setAccount(data))
      .catch(console.error);
  }, []);

  const initials = account ? getInitials(account.name) : "MK";

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAccountData()
      .then((data) => setAccount(data))
      .catch(console.error)
      .finally(() => setIsRefreshing(false));
  };

  // Safely read progress
  const completed = account?.verificationProgress?.completed ?? 0;
  const total = account?.verificationProgress?.total ?? 0;

  return (
    <View className="flex-1 bg-white">
      <TopBar
        title="Profile"
        rightComponent={
          <TouchableOpacity onPress={() => console.log("Korpor tapped")}>
            <Text className="text-lg font-bold text-black">Korpor</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Account row */}
        <PressableRow
          onPress={() =>
            router.push(
              "/main/components/profileScreens/profile/AccountDetails"
            )
          }
        >
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-green-200">
              <Text className="text-lg font-bold text-black">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-black">
                {account?.name || "Loading…"}
              </Text>
              <Text className="text-xs text-gray-600">
                Your account and details
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="black" />
          </View>
        </PressableRow>

        {/* KYC row: dynamic */}
        <PressableRow
          onPress={() =>
            router.push(
              "/main/components/profileScreens/profile/CompleteAccountSetupScreen"
            )
          }
        >
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Feather
              name="check-circle"
              size={24}
              color="black"
              className="mr-3"
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-black">
                Verify your account to start investing
              </Text>
              <Text className="text-xs text-gray-600">
                {`${completed} / ${total}`}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="black" />
          </View>
        </PressableRow>

        {/* Learn about investing */}
        <Text className="mb-4 text-base font-semibold text-black">
          Learn about investing
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {[
            {
              label: "How do I make money on Korpor?",
              route: "/main/components/profileScreens/profile/LearnHelp",
            },
            {
              label: "When will I receive my documents?",
              route: "/main/components/profileScreens/profile/LearnHelp",
            },
          ].map(({ label, route }, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(route)}
              activeOpacity={0.6}
              className="mr-4 w-60 rounded-lg bg-green-100 p-4 shadow"
            >
              <Text className="mb-3 text-sm font-semibold text-black">
                {label}
              </Text>
              <Feather name="arrow-right" size={20} color="black" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Settings */}
        <Text className="mb-4 text-base font-semibold text-black">
          Settings
        </Text>
        {[
          {
            label: "About Korpor",
            icon: "info",
            route: "/main/components/profileScreens/profile/aboutscreen",
          },
          {
            label: "Help Center",
            icon: "help-circle",
            route: "/main/components/profileScreens/profile/GetHelpScreen",
          },
          { label: "Notifications", icon: "bell" },
          {
            label: "Refer a Friend",
            icon: "users",
            route: "/main/components/profileScreens/profile/ReferAFriendScreen",
          },
          {
            label: "Feedback Survey",
            icon: "edit",
            url: "https://korpor.com/feedback",
          },
          {
            label: "Calculate My Potential",
            icon: "trending-up",
            route:
              "/main/components/profileScreens/profile/PotentialIncomeScreen",
          },
          {
            label: "Settings",
            icon: "settings",
            route: "/main/components/profileScreens/profile/settings",
          },
        ].map(({ label, icon, route, url }, idx) => (
          <PressableRow
            key={idx}
            onPress={() => {
              if (url) {
                Linking.openURL(url);
              } else if (route) {
                router.push(route);
              }
            }}
          >
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <Feather
                name={icon as any}
                size={20}
                color="black"
                className="mr-3"
              />
              <Text className="flex-1 text-sm text-black">{label}</Text>
              <Feather name="chevron-right" size={20} color="black" />
            </View>
          </PressableRow>
        ))}

        {/* Security & Privacy */}
        <Text className="mb-4 mt-6 text-base font-semibold text-black">
          Security & Privacy
        </Text>
        <PressableRow
          onPress={() =>
            router.push(
              "/main/components/profileScreens/profile/SecurityPrivacyScreen"
            )
          }
        >
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Feather name="lock" size={20} color="black" className="mr-3" />
            <Text className="flex-1 text-sm text-black">
              Security & Privacy
            </Text>
            <Feather name="chevron-right" size={20} color="black" />
          </View>
        </PressableRow>

        {/* Social icons */}
        <View className="mb-8 flex-row justify-center">
          {[
            {
              icon: "instagram",
              url: "https://www.instagram.com/korpor_software",
            },
            {
              icon: "facebook",
              url: "https://www.facebook.com/korpor_software",
            },
            {
              icon: "twitter",
              url: "https://twitter.com/korpor_software",
            },
          ].map(({ icon, url }) => (
            <TouchableOpacity
              key={icon}
              className="mx-4 h-10 w-10 items-center justify-center rounded-full border border-gray-300"
              activeOpacity={0.6}
              onPress={() => Linking.openURL(url)}
            >
              <Feather name={icon as any} size={20} color="black" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => console.log("Logout clicked")}
          activeOpacity={0.6}
          className="mb-6 rounded-lg bg-black py-3"
        >
          <Text className="text-center text-sm font-medium text-white">
            Logout
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="items-center">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-black">
            <Image
              source={require("@assets/logo.png")}
              style={{ width: 32, height: 32, tintColor: "white" }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-center text-xs text-gray-600">
            Korpor is a real estate investing app. All rights reserved ©{" "}
            {currentYear}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
