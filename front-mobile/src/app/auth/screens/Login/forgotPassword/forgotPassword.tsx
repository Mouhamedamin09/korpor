import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ForgotPasswordCard } from "@auth/components/complex";
import { router } from "expo-router";
const BackButton = require("@assets/angle-left.png");
const Logo = require("@assets/korporBlack.png");

import {
  SolidButton,
  EmailInput,
  OutlinedButton,
  OutlinedButtonSm,
  GoogleButton,
  DividerWithText,
} from "@auth/components/ui/index";
export default function ForgotPass() {
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSendLink = () => {
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // Proceed
    console.log("Reset link sent to:", email);
    router.push("auth/screens/Login/forgotPassword/OTPReset");
  };
  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        className="mt-10"
      >
        <Image source={BackButton} className="h-10 w-10" />
      </TouchableOpacity>
      <View className="justify-center items-center my-auto pb-14">
        <Image
          source={Logo}
          style={{ resizeMode: "contain" }}
          className="w-28 h-28"
        />
        <View className="w-[90%] h-auto rounded-2xl">
          <Text className="text-3xl font-semibold text-text self-center">
            Forgot Password?
          </Text>
          <Text className=" text-[#a1a1aa] mb-6 self-center">
            Enter your email to reset your password.
          </Text>
          <EmailInput
            placeholder="Email"
            value={email}
            onChangeText={(text: string) => setEmail(text)}
          />
          <OutlinedButtonSm title="Send Reset Link" onPress={handleSendLink} />
          {errorMessage ? (
            <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
          ) : null}
          <DividerWithText text="Or" />
          <GoogleButton
            text="Continue with Google"
            onPress={() => {
              console.log("Google button pressed");
            }}
          />
        </View>
      </View>
    </View>
  );
}
