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
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import { AccountData, fetchAccountData } from "@main/services/account";
import { logout } from "@auth/services/logout";

import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import {
  fetchDetailedVerificationStatus,
  BackendVerificationStatus,
} from "@main/services/Verification";
import { getInitials } from "@main/components/profileScreens/components/ui/string";

type VerificationProgress = {
  completed: number;
  total: number;
};

interface ExtendedAccountData extends AccountData {
  verificationProgress: VerificationProgress;
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

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [accountData, verificationStatus] = await Promise.all([
        fetchAccountData(),
        fetchDetailedVerificationStatus(),
      ]);

      // Calculate real verification progress
      let completed = 2; // Steps 1-2 are always complete (account + employment)
      if (verificationStatus?.identityStatus === "approved") completed++;
      if (verificationStatus?.addressStatus === "approved") completed++;

      const extendedAccountData: ExtendedAccountData = {
        ...accountData,
        verificationProgress: {
          completed,
          total: 4,
        },
      };

      setAccount(extendedAccountData);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("Session expired")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/auth/screens/Login"),
            },
          ]
        );
        return;
      }

      // For other errors, show a generic message but don't redirect
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const initials = account ? getInitials(account.name) : "MK";

  const onRefresh = async () => {
    await fetchData();
  };

  // Safely read progress
  const completed = account?.verificationProgress?.completed ?? 2;
  const total = account?.verificationProgress?.total ?? 4;

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setIsRefreshing(true);
            await logout();
            console.log("✅ Logout successful");
            // Navigate to the landing page
            router.replace("/");
          } catch (error: any) {
            console.error("❌ Logout error:", error);
            Alert.alert(
              "Logout Error",
              error.message || "An error occurred while logging out."
            );
          } finally {
            setIsRefreshing(false);
          }
        },
      },
    ]);
  };

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
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
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
          <View className=" mt-2 flex-row items-center rounded-3xl bg-white shadow-lg border border-[#E5E7EB] p-4">
            {/* icon bubble */}
            <View className="w-12 h-12 rounded-full bg-[#10B981]/10 items-center justify-center mr-4">
              <Feather
                name={completed === total ? "check" : "shield"}
                size={20}
                color="#000"
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-[#0A0E23] mb-1">
                Verify your account to start investing
              </Text>

              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  style={{ width: `${(completed / total) * 100}%` }}
                  className="h-full bg-[#10B981]"
                />
              </View>

              <Text className="text-xs text-[#6B7280] mt-1">
                {`${completed} of ${total} steps completed`}
              </Text>
            </View>

            <Feather name="chevron-right" size={24} color="#9CA3AF" />
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
              route: "/main/components/profileScreens/profile/GetHelpScreen",
            },
            {
              label: "When will I receive my documents?",
              route: "/main/components/profileScreens/profile/GetHelpScreen",
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
          onPress={handleLogout}
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
