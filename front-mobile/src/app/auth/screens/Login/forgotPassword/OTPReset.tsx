import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { router as ExpoRouter } from "expo-router";

import {
  OTPInput,
  OutlinedButtonSm,
  PressableText,
} from "../../../components/ui/index";

const BackButton = require("@assets/angle-left.png");
const Logo = require("@assets/korporBlack.png");

export default function OTPReset(): JSX.Element {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerify = async (): Promise<void> => {
    setErrorMessage("");
    const code = otp.join("");
    if (code.length < 4) {
      setErrorMessage("Please enter the full 4-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      // TODO: verify OTP via API
      console.log("OTP Verified:", code);
      ExpoRouter.push("auth/screens/Login/forgotPassword/resetPassword");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = (): void => {
    console.log("Resend Code pressed");
    // TODO: trigger resend functionality
  };

  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        onPress={() => ExpoRouter.back()}
        className=""
      >
        <Image source={BackButton} className="h-10 w-10 mt-10" />
      </TouchableOpacity>

      <View className="items-center mt-40">
        <Image
          source={Logo}
          style={{ resizeMode: "contain" }}
          className="w-28 h-28"
        />

        <View className="w-[90%] h-auto rounded-2xl">
        <View className="items-center px-4">
  <Text className="text-3xl font-semibold text-text text-center mb-2">
    Verify it's You
  </Text>
  <Text className="text-[#a1a1aa] mb-6 text-center font-semibold text-sm">
    We've sent a 4-digit code to your email. Enter it below to continue.
  </Text>
</View>


          <View className="items-center mb-3">
            <OTPInput otp={otp} setOtp={setOtp} />
          </View>

          <OutlinedButtonSm
            title={isLoading ? "Verifying..." : "Verify & Continue"}
            onPress={handleVerify}
            disabled={isLoading}
          />

          {isLoading && (
            <View className="items-center mt-2">
              <ActivityIndicator size="small" />
            </View>
          )}

          {errorMessage && (
            <Text className="text-red-500 text-sm mt-2 mb-2 text-center">
              {errorMessage}
            </Text>
          )}

          <View className="flex-row justify-center items-center pt-4">
            <Text className="text-[#a1a1aa] text-xs font-semibold">
              Didn't receive any code?{' '}
            </Text>
            <PressableText text="Resend Code" onPress={handleResend} />
          </View>
        </View>
      </View>
    </View>
  );
}
