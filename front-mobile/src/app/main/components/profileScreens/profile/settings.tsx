// screens/main/components/profileScreens/profile/SettingsScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  TopBar,
  Card,
  SwitchItem,
} from "@main/components/profileScreens/components/ui";
import { useRouter, useFocusEffect } from "expo-router";
import {
  fetchAccountData,
  fetchUserSettings,
  updateHaptics,
  UserSettings,
} from "@main/services/api";

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const [account, setAccount] = useState<{ email: string } | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Load account + settings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchAccountData()
        .then((data) => {
          if (!active) return;
          setAccount({ email: data.email });
          return fetchUserSettings(data.email);
        })
        .then((s) => {
          if (active) setSettings(s);
        })
        .catch(console.error);
      return () => {
        active = false;
      };
    }, [])
  );

  // show spinner while loading
  if (!settings) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // map preference -> label
  const prefLabel =
    settings.preference === "all"
      ? "All real estate investments"
      : `Comply with ${settings.region} laws only`;

  const openCurrency = () => {
    if (settings.currencyIntroSeen) {
      router.push("/main/components/profileScreens/profile/Currency");
    } else {
      router.push(
        "/main/components/profileScreens/profile/CurrencyIntroScreen"
      );
    }
  };

  const toggleHaptics = (val: boolean) => {
    if (!account) return;
    setSettings({ ...settings, haptics: val });
    updateHaptics(account.email, val);
  };

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Settings" onBackPress={() => router.back()} />
      <ScrollView className="px-4 py-4">
        {/* Language */}
        <Card extraStyle="p-0 mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() =>
              router.push(
                "/main/components/profileScreens/profile/LanguageScreen"
              )
            }
          >
            <Ionicons name="globe-outline" size={20} color="#000" />
            <View className="flex-1 ml-3">
              <Text className="text-base text-surfaceText">Language</Text>
            </View>
            <Text className="text-sm text-mutedText mr-2">English</Text>
            <Feather name="chevron-right" size={20} color="#71717a" />
          </TouchableOpacity>
        </Card>

        {/* Currency */}
        <Card extraStyle="p-0 mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={openCurrency}
          >
            <Ionicons name="wallet-outline" size={20} color="#000" />
            <View className="flex-1 ml-3">
              <Text className="text-base text-surfaceText">Currency</Text>
            </View>
            <Text className="text-sm text-mutedText mr-2">
              {settings.currency}
            </Text>
            <Feather name="chevron-right" size={20} color="#71717a" />
          </TouchableOpacity>
        </Card>

        {/* Investment preferences */}
        <Card extraStyle="p-0 mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() =>
              router.push(
                "/main/components/profileScreens/profile/InvestmentPreferencesScreen"
              )
            }
          >
            <Feather name="bar-chart-2" size={20} color="#000" />
            <View className="flex-1 ml-3">
              <Text className="text-base text-surfaceText">
                Investment preferences
              </Text>
              <Text className="text-xs text-mutedText mt-1">{prefLabel}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#71717a" />
          </TouchableOpacity>
        </Card>

        {/* Notification settings */}
        <Card extraStyle="p-0 mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() =>
              router.push(
                "/main/components/profileScreens/profile/NotificationSettingsScreen"
              )
            }
          >
            <Feather name="bell" size={20} color="#000" />
            <View className="flex-1 ml-3">
              <Text className="text-base text-surfaceText">
                Notification settings
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#71717a" />
          </TouchableOpacity>
        </Card>

        {/* Haptics */}
        <SwitchItem
          label="Haptic feedback"
          value={settings.haptics}
          onValueChange={toggleHaptics}
          description="Enable haptic feedback as you navigate through the app"
          iconName="smartphone"
        />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
