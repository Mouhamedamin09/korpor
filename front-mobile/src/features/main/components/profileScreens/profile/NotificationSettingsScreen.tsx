// app/screens/NotificationSettingsScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  TopBar,
  SwitchItem,
} from "@main/components/profileScreens/components/ui";
import { fetchAccountData } from "@main/services/api";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "@main/services/notifications";

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // --- hooks (always in same order) ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // ref to hold the previous “other” toggles
  const prevOthers = useRef<Omit<NotificationSettings, "pushNotifications">>({
    propertyLaunches: false,
    fundLaunches: false,
    productUpdates: false,
    marketing: false,
    investmentUpdates: false,
    newsletter: false,
  });

  // load account + notification settings
  const loadAll = async () => {
    try {
      const acct = await fetchAccountData();
      setAccountEmail(acct.email);

      const notif = await fetchNotificationSettings(acct.email);
      setSettings(notif);

      // initialize prevOthers from backend on first load
      prevOthers.current = {
        propertyLaunches: notif.propertyLaunches,
        fundLaunches: notif.fundLaunches,
        productUpdates: notif.productUpdates,
        marketing: notif.marketing,
        investmentUpdates: notif.investmentUpdates,
        newsletter: notif.newsletter,
      };
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  if (loading || settings === null) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // when Push = off, disable and blank out all others
  const othersDisabled = !settings.pushNotifications;

  const handleToggle = async <K extends keyof NotificationSettings>(
    key: K,
    val: boolean
  ) => {
    if (!accountEmail || !settings) return;

    if (key === "pushNotifications") {
      if (!val) {
        // turning OFF → snapshot current others, then zero them
        prevOthers.current = {
          propertyLaunches: settings.propertyLaunches,
          fundLaunches: settings.fundLaunches,
          productUpdates: settings.productUpdates,
          marketing: settings.marketing,
          investmentUpdates: settings.investmentUpdates,
          newsletter: settings.newsletter,
        };
        const allOff: NotificationSettings = {
          pushNotifications: false,
          propertyLaunches: false,
          fundLaunches: false,
          productUpdates: false,
          marketing: false,
          investmentUpdates: false,
          newsletter: false,
        };
        setSettings(allOff);
        try {
          await updateNotificationSettings(accountEmail, allOff);
        } catch (e) {
          console.error(e);
          setSettings(settings); // rollback
        }
      } else {
        // turning ON → restore previous others
        const restored: NotificationSettings = {
          pushNotifications: true,
          ...prevOthers.current,
        };
        setSettings(restored);
        try {
          await updateNotificationSettings(accountEmail, restored);
        } catch (e) {
          console.error(e);
          setSettings(settings); // rollback
        }
      }
      return;
    }

    // generic toggle for the other flags (only when push is on)
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    try {
      await updateNotificationSettings(accountEmail, { [key]: val });
    } catch (e) {
      console.error(e);
      setSettings(settings); // rollback
    }
  };

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Notification Settings" onBackPress={() => router.back()} />
    
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      

      <View className="p-4">
        <Text className="text-sm text-surfaceText mb-4">
          Each setting controls both email and push notifications.
        </Text>

        {/* Push notifications first */}
        <View className="bg-surface border border-border rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-surfaceText mb-2">
            Push notifications
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base text-surfaceText">
              Enable Push notifications
            </Text>
            <Switch
              trackColor={{ false: "#f4f4f4", true: "#2b7fff" }}
              thumbColor="#fff"
              ios_backgroundColor="#f4f4f4"
              onValueChange={(v) => handleToggle("pushNotifications", v)}
              value={settings.pushNotifications}
            />
          </View>
          <Text className="text-sm text-mutedText">
            Disabling this will turn off all push notifications, but you’ll
            still get emails for your selected topics.
          </Text>
        </View>

        {/* The rest */}
        <SwitchItem
          label="Property launches"
          value={settings.propertyLaunches}
          onValueChange={(v) => handleToggle("propertyLaunches", v)}
          description="Get notified about all new property launches and funding updates."
          iconName="bell"
          disabled={othersDisabled}
        />
        <SwitchItem
          label="Fund launches"
          value={settings.fundLaunches}
          onValueChange={(v) => handleToggle("fundLaunches", v)}
          description="Stay updated on new fund launches and their funding progress."
          iconName="briefcase"
          disabled={othersDisabled}
        />
        <SwitchItem
          label="Product updates"
          value={settings.productUpdates}
          onValueChange={(v) => handleToggle("productUpdates", v)}
          description="Be the first to know about new features and product updates."
          iconName="edit"
          disabled={othersDisabled}
        />
        <SwitchItem
          label="Marketing"
          value={settings.marketing}
          onValueChange={(v) => handleToggle("marketing", v)}
          description="Receive offers, promotions, and key announcements."
          iconName="mail"
          disabled={othersDisabled}
        />
        <SwitchItem
          label="Investment updates"
          value={settings.investmentUpdates}
          onValueChange={(v) => handleToggle("investmentUpdates", v)}
          description="Track progress of your investments and funding updates."
          iconName="trending-up"
          disabled={othersDisabled}
        />
        <SwitchItem
          label="Newsletter"
          value={settings.newsletter}
          onValueChange={(v) => handleToggle("newsletter", v)}
          description="Get our bi-weekly newsletter with the latest insights."
          iconName="file-text"
          disabled={othersDisabled}
        />
      </View>
    </ScrollView>
    </View>
  );
}
