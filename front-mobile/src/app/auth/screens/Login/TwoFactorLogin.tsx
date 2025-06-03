import React, { useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import API_URL from "@shared/constants/api";
import { OTPInput, SolidButton, PressableText } from "@auth/components/ui";
import { authStore } from "../../services/authStore";

export default function TwoFactorLogin() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, email } = params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits for 2FA
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify2FA = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const code = otp.join("");
      if (code.length < 6) {
        setErrorMessage("Please enter the 6-digit code.");
        setIsLoading(false);
        return;
      }

      const requestData = {
        userId,
        token: code,
      };

      console.log("Verifying 2FA with data:", requestData);

      const response = await axios.post(
        `${API_URL}/api/auth/complete-2fa-login`,
        requestData
      );

      console.log("2FA verification successful:", response.data);

      // Store authentication tokens using SecureStore only
      if (response.data.accessToken && response.data.refreshToken) {
        await authStore
          .getState()
          .setTokens(response.data.accessToken, response.data.refreshToken);

        console.log(
          "✅ Authentication tokens stored in SecureStore successfully"
        );
      }

      Alert.alert("Success", "You have successfully logged in!", [
        {
          text: "OK",
          onPress: () => router.replace("/main/screens/(tabs)/properties"),
        },
      ]);
    } catch (error: any) {
      console.error("2FA verification failed:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8f4f4] justify-center items-center">
      <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Two-Factor Authentication
        </Text>
        <Text className="text-gray-500 mb-6">
          Enter the 6-digit code from your authenticator app to complete your
          login.
        </Text>

        <Text className="text-sm text-gray-600 mb-4">
          Signing in as: <Text className="font-semibold">{email}</Text>
        </Text>

        <View className="items-center mb-4">
          <OTPInput otp={otp} setOtp={setOtp} />
        </View>

        <SolidButton
          title={isLoading ? "Verifying..." : "Verify & Login"}
          onPress={handleVerify2FA}
          disabled={isLoading}
        />

        {/* Show error message if any */}
        {errorMessage ? (
          <Text className="text-red-500 text-sm mt-3 text-center">
            {errorMessage}
          </Text>
        ) : null}

        {/* Loading spinner */}
        {isLoading && (
          <View className="items-center mt-3">
            <ActivityIndicator size="small" color="#000" />
          </View>
        )}

        {/* Back to login */}
        <View className="flex-row justify-center items-center pt-4">
          <Text className="text-gray-500 text-sm">Wrong account? </Text>
          <PressableText
            text="Back to Login"
            onPress={() => router.replace("/auth/screens/Login")}
          />
        </View>
      </View>
    </View>
  );
}
