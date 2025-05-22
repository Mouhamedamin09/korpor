// app/screens/main/components/profileScreens/profile/ManageSocialLoginsScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

import {
  TopBar,
  ListItem,
} from "@main/components/profileScreens/components/ui";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import {
  fetchSocialMethod,
  revokeSocial,
  SocialMethod,
} from "@main/services/Social";

export default function ManageSocialLoginsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<SocialMethod | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchSocialMethod()
      .then(setMethod)
      .catch(() => Alert.alert("Error", "Failed to load login method."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || method === null) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isGoogle = method === "google";
  const label = isGoogle ? "Google" : "Email & password";
  const description = isGoogle
    ? "Manage Google sign-in for your Korpor account"
    : "You signed up with email & password";

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await revokeSocial(method!);
      Alert.alert("Disconnected", `You’ve disconnected from ${label}.`);
      setMethod("email"); // fallback
      setSheetVisible(false);
    } catch {
      Alert.alert("Error", "Could not disconnect. Try again.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        <TopBar
          title="Manage social logins"
          onBackPress={() => router.back()}
        />

        <View className="px-4 pt-4">
          <ListItem
            iconComponent={() =>
              isGoogle ? (
                <FontAwesome name="google" size={20} color="#000" />
              ) : (
                <Feather name="mail" size={20} color="#000" />
              )
            }
            label={label}
            description={description}
            RightComponent={() => (
              <Feather name="more-vertical" size={20} color="#000" />
            )}
            onPress={() => setSheetVisible(true)}
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      >
        <View className="px-4 pb-6">
          {/* Disconnect button */}
          <TouchableOpacity
            onPress={handleRevoke}
            disabled={revoking}
            className={`bg-black rounded-lg p-4 items-center mb-3 ${
              revoking ? "opacity-50" : ""
            }`}
          >
            <Text className="text-base font-semibold text-white">
              Disconnect from {label}
            </Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            onPress={() => setSheetVisible(false)}
            className="bg-white rounded-lg p-4 items-center border border-gray-200"
          >
            <Text className="text-base font-semibold text-gray-900">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}
