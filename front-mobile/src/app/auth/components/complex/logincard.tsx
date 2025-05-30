import React, { useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";

import {
  EmailInput,
  PasswordInput,
  GoogleButton,
  DividerWithText,
  RememberMeCheckbox,
  PressableText,
  OutlinedButtonSm,
} from "../ui";
import { signin } from "@auth/services/signin";

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
      console.error("Sign-in error:", error);
      setErrorMessage(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-[90%] h-auto bg-background rounded-2xl border shadow border-border p-5">
      <Text className="text-3xl font-semibold text-text mb-1 ml-1">
        Welcome back
      </Text>
      <Text className="ml-1 text-[#a1a1aa] mb-6">
        Enter your email and password to log in
      </Text>

      {/* Google OAuth */}
      <GoogleButton
        text="Continue with Google"
        onPress={() => console.log("Google button pressed")}
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
        editable={!isLoading}
      />

      {/* Password Input */}
      <PasswordInput
        placeholder="Password"
        value={password}
        onChangeText={(text: string) => {
          setPassword(text);
          setErrorMessage("");
        }}
        editable={!isLoading}
      />

      {/* Login Button */}
      <OutlinedButtonSm
        title={isLoading ? "Signing in..." : "Log in"}
        onPress={handleSignin}
        disabled={isLoading}
      />

      {/* Loading spinner */}
      {isLoading && (
        <View className="items-center mt-2">
          <ActivityIndicator size="small" color="#fafafa" />
        </View>
      )}

      {/* Error message */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2 mb-2 text-center">
          {errorMessage}
        </Text>
      ) : null}

      {/* Options */}
      <View className="flex-row items-center pt-1 justify-between mx-1">
        <RememberMeCheckbox disabled={isLoading} />
        <PressableText
          text="Forgot password?"
          onPress={() => {
            if (!isLoading) {
              router.push("auth/screens/Login/forgotPassword/forgotPassword");
            }
          }}
        />
      </View>

      {/* Sign-up */}
      <View className="flex-row justify-center items-center pt-4">
        <Text className="ml-2 text-gray-400 text-xs font-semibold">
          Don't have an account?{" "}
        </Text>
        <PressableText
          text="Sign up"
          onPress={() => {
            if (!isLoading) {
              router.push("auth/screens/Signup/signup");
            }
          }}
        />
      </View>
    </View>
  );
}
