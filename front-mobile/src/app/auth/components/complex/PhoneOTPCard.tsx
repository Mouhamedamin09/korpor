import { View, Text } from "react-native";
import { SolidButton, OTPInput, PressableText } from "../ui";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "@shared/constants/api";
import { authStore } from "../../services/authStore";

interface PhoneOTPCardProps {
  userId: string;
}

export default function PhoneOTPCard({ userId }: PhoneOTPCardProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits for phone
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Send phone verification code when component mounts
  useEffect(() => {
    sendPhoneVerification();
  }, []);

  const sendPhoneVerification = async () => {
    try {
      setIsResending(true);
      setErrorMessage("");

      const response = await axios.post(
        `${API_URL}/api/auth/send-phone-verification`,
        {
          userId,
        }
      );

      setCodeSent(true);
      console.log("Phone verification sent:", response.data.message);
    } catch (error: any) {
      console.error("Failed to send phone verification:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    setErrorMessage("");
    setIsLoading(true);

    const code = otp.join(""); // e.g. ["1","2","3","4","5","6"] => "123456"
    if (code.length < 6) {
      setErrorMessage("Please enter the 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-phone`, {
        userId,
        verificationCode: code,
      });

      console.log("Phone verified successfully:", response.data);

      // Store authentication tokens using authStore (SecureStore)
      if (response.data.accessToken && response.data.refreshToken) {
        await authStore
          .getState()
          .setTokens(response.data.accessToken, response.data.refreshToken);

        // Also store user data in AsyncStorage for compatibility
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(response.data.user)
        );
        await AsyncStorage.setItem("userRole", response.data.role || "user");

        console.log(
          "✅ Authentication tokens stored in authStore successfully"
        );
      }

      // Navigate to onboarding instead of success screen
      router.replace("/auth/screens/onboarding/onboarding");
    } catch (error: any) {
      console.error("Phone verification failed:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!codeSent && !errorMessage) {
    return (
      <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Sending Verification Code...
        </Text>
        <Text className="text-gray-500 mb-6">
          Please wait while we send a verification code to your phone.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <Text className="text-3xl font-bold text-gray-900 mb-1">
        Verify Your Phone
      </Text>
      <Text className="text-gray-500 mb-6">
        We've sent a 6-digit code to your phone number. Enter it below to
        complete your registration.
      </Text>

      <View className="items-center mb-3">
        <OTPInput otp={otp} setOtp={setOtp} />
      </View>

      <SolidButton
        title={isLoading ? "Verifying..." : "Verify Phone"}
        onPress={handleVerify}
        disabled={isLoading}
      />

      {/* Show error message if any */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      ) : null}

      <View className="flex-row justify-center items-center pt-4 mb-3">
        <Text className="text-gray-500 text-sm font-medium">
          Didn't receive any code?
        </Text>
        <PressableText text=" Resend Code" onPress={sendPhoneVerification} />
      </View>
    </View>
  );
}
