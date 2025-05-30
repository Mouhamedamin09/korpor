// screens/main/components/profileScreens/profile/MultiFactorAuthScreen.tsx

import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import { get2FAStatus, disable2FA, TwoFactorStatus } from "@main/services/TwoFactor";

export default function MultiFactorAuthScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const twoFactorStatus = await get2FAStatus();
      setStatus(twoFactorStatus);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
      // If there's an error, assume 2FA is not enabled
      setStatus({ enabled: false, backupCodesRemaining: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = () => {
    Alert.alert(
      "Disable Two-Factor Authentication",
      "Are you sure you want to disable 2FA? This will make your account less secure.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            Alert.prompt(
              "Enter Password",
              "Please enter your password to disable 2FA:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Disable",
                  style: "destructive",
                  onPress: async (password) => {
                    if (password) {
                      try {
                        setLoading(true);
                        await disable2FA(password);
                        Alert.alert("Success", "2FA has been disabled successfully.");
                        loadStatus(); // Refresh status
                      } catch (error: any) {
                        Alert.alert("Error", error.message || "Failed to disable 2FA");
                      } finally {
                        setLoading(false);
                      }
                    }
                  },
                },
              ],
              "secure-text"
            );
          },
        },
      ]
    );
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
                Enabled on: {status.setupAt ? new Date(status.setupAt).toLocaleDateString() : 'Unknown'}
              </Text>
              <Text className="text-sm text-mutedText">
                Backup codes remaining: {status.backupCodesRemaining}
              </Text>
            </View>
          )}
        </Card>

        {/* Authenticator app option */}
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
                <Feather name="lock" size={20} color="#000" className="mr-4" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-surfaceText">
                    Use an authenticator app
                  </Text>
                  <Text className="text-xs text-mutedText">
                    You will use an app (e.g. Google Authenticator) to generate
                    6-digit codes when you log in.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#000" />
            </Card>
          </TouchableOpacity>
        ) : (
          <View className="space-y-3">
            {/* Disable 2FA */}
            <TouchableOpacity onPress={handleDisable2FA}>
              <Card extraStyle="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Feather name="shield-off" size={20} color="#EF4444" className="mr-4" />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-red-600">
                      Disable 2FA
                    </Text>
                    <Text className="text-xs text-mutedText">
                      Turn off two-factor authentication for your account
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#EF4444" />
              </Card>
            </TouchableOpacity>

            {/* Regenerate backup codes */}
            <TouchableOpacity 
              onPress={() => 
                router.push("/main/components/profileScreens/profile/BackupCodesScreen")
              }
            >
              <Card extraStyle="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Feather name="key" size={20} color="#000" className="mr-4" />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-surfaceText">
                      Backup codes
                    </Text>
                    <Text className="text-xs text-mutedText">
                      View and regenerate your backup recovery codes
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#000" />
              </Card>
            </TouchableOpacity>
          </View>
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
  );
}
