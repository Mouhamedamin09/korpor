// app/screens/main/components/profileScreens/profile/SetupAuthenticatorApp.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import {
  fetchAuthSetup,
  verifyAuthCode,
  AuthSetupResponse,
} from "@main/services/TwoFactor";

const { width: screenWidth } = Dimensions.get("window");

export default function SetupAuthenticatorApp() {
  const router = useRouter();
  const [setup, setSetup] = useState<AuthSetupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAuthSetup();
        setSetup(data);
      } catch {
        Alert.alert("Error", "Could not load 2FA setup.");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      return Alert.alert("Invalid code", "Please enter a 6-digit code.");
    }
    setVerifying(true);
    try {
      const ok = await verifyAuthCode(setup!.secret, code);
      if (ok) {
        router.push(
          "/main/components/profileScreens/profile/TwoFactorEnabledScreen"
        );
      } else {
        Alert.alert("Error", "Code did not match. Try again.");
      }
    } catch {
      Alert.alert("Error", "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading || !setup) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <TopBar title="Set up Authenticator" onBackPress={() => router.back()} />

      <View className="px-4 pt-6 pb-8 space-y-6">
        {/* QR Scan Flow */}
        <Text className="text-base text-gray-700">
          Scan this QR code with your authenticator app (e.g. Google
          Authenticator). If scanning fails, try the link below.
        </Text>
        <Card extraStyle="items-center p-6">
          <QRCode value={setup.otpauthUrl} size={screenWidth * 0.6} />
        </Card>

        {/* OR Separator */}
        <View className="flex-row items-center justify-center">
          <View className="h-px bg-gray-300 flex-1 mx-2" />
          <Text className="text-xs text-gray-500">OR</Text>
          <View className="h-px bg-gray-300 flex-1 mx-2" />
        </View>

        {/* Deep-link Flow */}
        <TouchableOpacity
          onPress={() => Linking.openURL(setup.otpauthUrl)}
          className="bg-gray-100 rounded-lg p-4 flex-row items-center justify-center my-4"
        >
          <Feather name="link" size={20} color="#555" />
          <Text className="ml-2 text-base text-gray-800">
            Open in Authenticator App
          </Text>
        </TouchableOpacity>

        {/* Manual Secret */}
        <Card extraStyle="p-4">
          <Text className="text-sm text-gray-500 mb-1">Manual secret</Text>
          <View className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-4">
            <Text className="text-base font-mono text-gray-800">
              {setup.secret}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigator.clipboard.writeText(setup.secret);
                Alert.alert("Copied", "Secret copied to clipboard.");
              }}
            >
              <Feather name="copy" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Code Input */}
          <Text className="text-sm text-gray-500 mb-2">
            Enter the 6-digit code from your app to verify.
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            className="border border-gray-300 rounded-lg p-3 text-center text-xl tracking-widest mb-4"
          />
          <TouchableOpacity
            onPress={handleVerify}
            disabled={verifying}
            className={`bg-black rounded-lg p-4 items-center ${
              verifying ? "opacity-50" : ""
            }`}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Verify & Enable</Text>
            )}
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
