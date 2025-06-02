// screens/main/components/profileScreens/profile/MultiFactorAuthScreen.tsx

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import {
  get2FAStatus,
  disable2FA,
  TwoFactorStatus,
} from "@main/services/TwoFactor";

export default function MultiFactorAuthScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const twoFactorStatus = await get2FAStatus();
      setStatus(twoFactorStatus);
    } catch (error) {
      console.error("Error loading 2FA status:", error);
      // If there's an error, assume 2FA is not enabled
      setStatus({ enabled: false });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = () => {
    setPassword("");
    setErrorMessage("");
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setPassword("");
    setErrorMessage("");
  };

  const confirmDisable2FA = async () => {
    if (!password.trim()) {
      setErrorMessage("Password is required");
      return;
    }

    try {
      setDisabling(true);
      setErrorMessage("");

      console.log("🔄 Attempting to disable 2FA...");
      await disable2FA(password);

      // Close bottom sheet and refresh status
      setShowBottomSheet(false);
      setPassword("");
      await loadStatus();

      console.log("✅ 2FA disabled successfully");
    } catch (error: any) {
      console.error("❌ Failed to disable 2FA:", error);
      setErrorMessage(error.message || "Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-surfaceText">Loading 2FA status...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-background">
        <TopBar
          title="Multi-factor authentication"
          onBackPress={() => router.back()}
        />

        <View className="px-4 py-4 space-y-4">
          {/* Current Status */}
          <Card extraStyle="p-4">
            <View className="flex-row items-center mb-2">
              <Feather
                name={status?.enabled ? "shield-check" : "shield-off"}
                size={20}
                color={status?.enabled ? "#10B981" : "#6B7280"}
                className="mr-3"
              />
              <Text className="text-lg font-semibold text-surfaceText">
                2FA Status: {status?.enabled ? "Enabled" : "Disabled"}
              </Text>
            </View>

            {status?.enabled && (
              <View className="ml-8">
                <Text className="text-sm text-mutedText">
                  Enabled on:{" "}
                  {status.setupAt
                    ? new Date(status.setupAt).toLocaleDateString()
                    : "Unknown"}
                </Text>
              </View>
            )}
          </Card>

          {/* Authenticator app setup or disable 2FA */}
          {!status?.enabled ? (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/main/components/profileScreens/profile/SetupAuthenticatorApp"
                )
              }
            >
              <Card extraStyle="flex-row items-center justify-between">
                <View className="flex-row items-start flex-1">
                  <Feather
                    name="lock"
                    size={20}
                    color="#000"
                    className="mr-4"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-surfaceText">
                      Use an authenticator app
                    </Text>
                    <Text className="text-xs text-mutedText">
                      You will use an app (e.g. Google Authenticator) to
                      generate 6-digit codes when you log in.
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#000" />
              </Card>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleDisable2FA} disabled={disabling}>
              <Card extraStyle="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Feather
                    name="shield-off"
                    size={20}
                    color={disabling ? "#9CA3AF" : "#EF4444"}
                    className="mr-4"
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-base font-medium ${
                        disabling ? "text-gray-400" : "text-red-600"
                      }`}
                    >
                      {disabling ? "Disabling 2FA..." : "Disable 2FA"}
                    </Text>
                    <Text className="text-xs text-mutedText">
                      Turn off two-factor authentication for your account
                    </Text>
                  </View>
                </View>
                {disabling ? (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                  <Feather name="chevron-right" size={20} color="#EF4444" />
                )}
              </Card>
            </TouchableOpacity>
          )}

          {/* Phone number option (disabled) */}
          <View className="opacity-40">
            <Card extraStyle="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Feather
                  name="smartphone"
                  size={20}
                  color="#000"
                  className="mr-4"
                />
                <View className="flex-1">
                  <Text className="text-base font-medium text-surfaceText">
                    Use your phone number
                  </Text>
                  <Text className="text-xs text-mutedText">
                    This feature is only available to Korpor investors.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#000" />
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Disable 2FA Bottom Sheet */}
      <BottomSheet visible={showBottomSheet} onClose={closeBottomSheet}>
        <View className="py-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Disable Two-Factor Authentication
          </Text>
          <Text className="text-sm text-gray-600 mb-6">
            Are you sure you want to disable 2FA? This will make your account
            less secure.
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm
            </Text>
            <View className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
              <TextInput
                className="text-base text-gray-900"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!disabling}
                autoFocus
              />
            </View>
          </View>

          {errorMessage ? (
            <Text className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </Text>
          ) : null}

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg py-3"
              onPress={closeBottomSheet}
              disabled={disabling}
            >
              <Text className="text-center text-gray-800 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 ${
                disabling ? "bg-red-300" : "bg-red-500"
              }`}
              onPress={confirmDisable2FA}
              disabled={disabling}
            >
              <Text className="text-center text-white font-medium">
                {disabling ? "Disabling..." : "Disable 2FA"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
