import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import { regenerateBackupCodes } from "@main/services/TwoFactor";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BackupCodesScreen() {
  const router = useRouter();
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackupCodes();
  }, []);

  const loadBackupCodes = async () => {
    try {
      setLoading(true);
      const storedCodes = await AsyncStorage.getItem('2fa_backup_codes');
      if (storedCodes) {
        setBackupCodes(JSON.parse(storedCodes));
      }
    } catch (error) {
      console.error('Error loading backup codes:', error);
      Alert.alert('Error', 'Failed to load backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCodes = () => {
    Alert.alert(
      "Regenerate Backup Codes",
      "This will replace all existing backup codes. Make sure to save the new codes safely.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          onPress: () => {
            Alert.prompt(
              "Enter Password",
              "Please enter your password to regenerate backup codes:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Regenerate",
                  onPress: async (password) => {
                    if (password) {
                      try {
                        setLoading(true);
                        const newCodes = await regenerateBackupCodes(password);
                        setBackupCodes(newCodes);
                        Alert.alert(
                          "Success",
                          "New backup codes have been generated. Please save them in a secure place."
                        );
                      } catch (error: any) {
                        Alert.alert("Error", error.message || "Failed to regenerate backup codes");
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

  const copyAllCodes = () => {
    const codesText = backupCodes.join('\n');
    Clipboard.setString(codesText);
    Alert.alert('Copied', 'All backup codes have been copied to clipboard');
  };

  const copyCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied', `Code ${code} copied to clipboard`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-surfaceText">Loading backup codes...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <TopBar
        title="Backup Codes"
        onBackPress={() => router.back()}
      />

      <View className="px-4 py-4">
        {/* Information Card */}
        <Card extraStyle="p-4 mb-4">
          <View className="flex-row items-start mb-3">
            <Feather name="info" size={20} color="#3B82F6" className="mr-3 mt-1" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-surfaceText mb-2">
                Important Information
              </Text>
              <Text className="text-sm text-mutedText leading-5">
                • Each backup code can only be used once{'\n'}
                • Save these codes in a secure place{'\n'}
                • Use them if you lose access to your authenticator app{'\n'}
                • Generate new codes if you run out
              </Text>
            </View>
          </View>
        </Card>

        {/* Backup Codes */}
        {backupCodes.length > 0 ? (
          <Card extraStyle="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-surfaceText">
                Your Backup Codes
              </Text>
              <TouchableOpacity onPress={copyAllCodes}>
                <View className="flex-row items-center">
                  <Feather name="copy" size={16} color="#3B82F6" className="mr-1" />
                  <Text className="text-sm text-blue-600">Copy All</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="space-y-2">
              {backupCodes.map((code, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => copyCode(code)}
                  className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <Text className="text-base font-mono text-gray-900">
                    {code}
                  </Text>
                  <Feather name="copy" size={16} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ) : (
          <Card extraStyle="p-4 mb-4 items-center">
            <Feather name="key" size={48} color="#6B7280" className="mb-4" />
            <Text className="text-lg font-semibold text-surfaceText mb-2">
              No Backup Codes Found
            </Text>
            <Text className="text-sm text-mutedText text-center">
              Generate backup codes to ensure you can access your account if you lose your authenticator app.
            </Text>
          </Card>
        )}

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity onPress={handleRegenerateCodes}>
            <Card extraStyle="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Feather name="refresh-cw" size={20} color="#000" className="mr-4" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-surfaceText">
                    Generate New Codes
                  </Text>
                  <Text className="text-xs text-mutedText">
                    Replace all existing backup codes with new ones
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#000" />
            </Card>
          </TouchableOpacity>

          {backupCodes.length > 0 && (
            <TouchableOpacity onPress={copyAllCodes}>
              <Card extraStyle="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Feather name="download" size={20} color="#000" className="mr-4" />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-surfaceText">
                      Copy All Codes
                    </Text>
                    <Text className="text-xs text-mutedText">
                      Copy all backup codes to clipboard
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#000" />
              </Card>
            </TouchableOpacity>
          )}
        </View>

        {/* Warning */}
        <Card extraStyle="p-4 mt-6 bg-yellow-50 border-yellow-200">
          <View className="flex-row items-start">
            <Feather name="alert-triangle" size={20} color="#F59E0B" className="mr-3 mt-1" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-yellow-800 mb-1">
                Keep Your Codes Safe
              </Text>
              <Text className="text-sm text-yellow-700">
                Store these codes in a password manager or write them down and keep them in a secure location. Anyone with these codes can access your account.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 