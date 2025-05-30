// app/screens/InvestmentPreferencesScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import {
  getUserPreferences,
  setUserPreference,
  setUserRegion,
  Market,
  Preference,
} from "@main/services/Preferences";

export default function InvestmentPreferencesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Market>("Tunisia");
  const [pref, setPref] = useState<Preference>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserPreferences()
      .then(({ region, preference }) => {
        setRegion(region);
        setPref(preference);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = async (newPref: Preference) => {
    if (newPref === pref) return;
    setSaving(true);
    try {
      const { preference } = await setUserPreference(newPref);
      setPref(preference);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const infoText = `All properties are tailored to your region: ${region}.`;

  return (
    <View className="flex-1 bg-white">
      <TopBar
        title="Investment preferences"
        onBackPress={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card extraStyle="p-0">
          {/* All investments */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between px-4 py-5"
            onPress={() => update("all")}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                All real estate investments
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Access every opportunity on Korpor.
              </Text>
            </View>
            <View className="ml-4">
              {pref === "all" ? (
                <Feather name="check-circle" size={24} color="#34D37D" />
              ) : (
                <Feather name="circle" size={24} color="#D1D5DB" />
              )}
            </View>
          </TouchableOpacity>
          <View className="border-t border-gray-200" />

          {/* Region-compliant */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center justify-between px-4 py-5 border-l-2"
            style={{
              borderColor: pref === "local" ? "#34D37D" : "transparent",
            }}
            onPress={() => update("local")}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Comply with {region} laws only
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Show only properties vetted under {region} regulations.
              </Text>
            </View>
            <View className="ml-4">
              {pref === "local" ? (
                <Feather name="check-circle" size={24} color="#34D37D" />
              ) : (
                <Feather name="circle" size={24} color="#D1D5DB" />
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {/* Extended Info */}
        <Card extraStyle="mt-4 p-4 bg-gray-50">
          <Text className="text-sm text-gray-700 mb-2">{infoText}</Text>
          <View className="space-y-1">
            <Text className="text-xs text-gray-600">
              • Listings updated daily with new properties
            </Text>
            <Text className="text-xs text-gray-600">
              • No hidden fees—what you see is what you pay
            </Text>
            <Text className="text-xs text-gray-600">
              • Support in English, Arabic & French
            </Text>
          </View>
        </Card>

        {/* Saving indicator */}
        {saving && (
          <View className="mt-4 items-center">
            <ActivityIndicator size="small" color="#34D37D" />
            <Text className="text-xs text-gray-600 mt-1">Saving…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
