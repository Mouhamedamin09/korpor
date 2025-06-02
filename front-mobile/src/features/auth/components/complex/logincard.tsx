import React, { useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";

import {
  EmailInput,
  PasswordInput,
  SolidButton,
  GoogleButton,
  DividerWithText,
  RememberMeCheckbox,
  PressableText,
} from "../ui";
import { signin, TwoFactorRequiredError } from "@auth/services/signin";

export default function LoginCard(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignin = async (): Promise<void> => {
    setErrorMessage("");
    setIsLoading(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill out all required fields.");
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const responseData = await signin({ email, password });
      console.log("Sign-in successful:", responseData);

      Alert.alert("Success", "You have successfully logged in!", [
        {
          text: "OK",
          onPress: () => router.replace("/main/screens/(tabs)/properties"),
        },
      ]);
    } catch (error: any) {
      console.log("🔍 FEATURES LOGINCARD: Caught error in LoginCard");
      console.error("Sign-in error:", error);
      console.log("Error details:", {
        message: error.message,
        name: error.name,
        requires2FA: error.requires2FA,
        userId: error.userId,
        email: error.email,
        constructor: error.constructor?.name,
        typeof: typeof error,
        isInstance: error instanceof Error,
      });

      // Handle 2FA required error - multiple checks for compatibility
      if (
        error?.requires2FA ||
        error?.name === "TwoFactorRequiredError" ||
        error?.message?.includes("2FA verification required") ||
        (error?.userId &&
          error?.email &&
          error?.message?.includes("Password verified"))
      ) {
        console.log(
          "🔐 FEATURES LOGINCARD: 2FA detected, redirecting to 2FA verification"
        );
        console.log("2FA Error details:", {
          name: error.name,
          requires2FA: error.requires2FA,
          userId: error.userId,
          email: error.email,
        });

        // Clear loading state before navigation
        setIsLoading(false);

        // Navigate to 2FA verification screen with user info
        try {
          console.log(
            "🔄 FEATURES LOGINCARD: Attempting navigation to 2FA screen"
          );

          const navigationParams = {
            userId: error.userId.toString(),
            email: error.email,
          };

          console.log("Navigation params:", navigationParams);

          router.replace({
            pathname: "/auth/screens/Login/TwoFactorLogin",
            params: navigationParams,
          });

          console.log(
            "✅ FEATURES LOGINCARD: Navigation to 2FA screen initiated"
          );
          return;
        } catch (navError) {
          console.error("❌ FEATURES LOGINCARD: Navigation error:", navError);
          setErrorMessage(
            "Unable to navigate to 2FA screen. Please try again."
          );
          setIsLoading(false);
          return;
        }
      }

      console.log(
        "⚠️ FEATURES LOGINCARD: 2FA not detected, showing error message"
      );
      setErrorMessage(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-[90%] h-auto bg-[#09090b] rounded-2xl border border-[#3f3f46] p-5">
      <Text className="text-4xl font-bold text-[#fafafa] mb-1 ml-1">
        Sign in to your Account
      </Text>
      <Text className="ml-1 text-[#a1a1aa] mb-6 text-small">
        Enter your email and password to log in
      </Text>

      <GoogleButton
        text="Continue with Google"
        onPress={() => {
          console.log("Google button pressed");
        }}
      />

      <DividerWithText text="Or login with" />

      {/* Email Input */}
      <EmailInput
        placeholder="Email"
        value={email}
        onChangeText={(text: string) => {
          setEmail(text);
          setErrorMessage("");
        }}
      />

      {/* Password Input */}
      <PasswordInput
        placeholder="Password"
        value={password}
        onChangeText={(text: string) => {
          setPassword(text);
          setErrorMessage("");
        }}
      />

      {/* Login Button */}
      <SolidButton
        title={isLoading ? "Signing in..." : "Log in"}
        onPress={handleSignin}
      />

      {/* Loading spinner */}
      {isLoading && (
        <View className="items-center mt-2">
          <ActivityIndicator size="small" color="#fafafa" />
        </View>
      )}

      {/* Show error message if any */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2 mb-2 text-center">
          {errorMessage}
        </Text>
      ) : null}

      <View className="flex-row items-center pt-1 justify-between mx-1">
        <RememberMeCheckbox />
        <PressableText
          text="Forgot password?"
          onPress={() => {
            if (!isLoading) {
              router.replace(
                "auth/screens/Login/forgotPassword/forgotPassword"
              );
            }
          }}
        />
      </View>

      <View className="flex-row justify-center items-center pt-4">
        <Text className="ml-2 text-gray-400 text-xs font-semibold">
          Don't have an account?{" "}
        </Text>
        <PressableText
          text="Sign up"
          onPress={() => {
            if (!isLoading) {
              router.replace("auth/screens/Signup/signup");
            }
          }}
        />
      </View>
    </View>
  );
}
