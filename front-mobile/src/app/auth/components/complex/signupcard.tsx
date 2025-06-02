import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  GoogleButton,
  DividerWithText,
  Input,
  SolidButton,
  DateInput,
  PhoneNumberInput,
  EmailInput,
  PressableText,
  OutlinedButtonSm,
} from "../ui";
import BirthdayPicker from "./birthdaypicker";

export default function SignupCard() {
  const router = useRouter();

  /* ────────────── state ────────────── */
  const [isBirthdayPickerVisible, setIsBirthdayPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* ────────────── helpers ────────────── */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,4}\s?\d{4,}$/; // e.g. +216 12345678

  const handleSignup = () => {
    // reset any previous error
    setErrorMessage("");

    // trim once
    const trimmed = {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthdate: selectedDate.trim(),
    };

    // required checks
    if (
      !trimmed.name ||
      !trimmed.surname ||
      !trimmed.email ||
      !trimmed.phone ||
      !trimmed.birthdate
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (!emailRegex.test(trimmed.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(trimmed.phone.replace(/\s/g, ""))) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    // all good → next step
    router.push({
      pathname: "/auth/screens/Signup/password",
      params: trimmed,
    });
  };

  /* ────────────── render ────────────── */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        /* Center children horizontally */
        contentContainerStyle={{ alignItems: "center" }}
        className="px-4"
      >
        {/* Card */}
        <View
          className="w-full max-w-[420px] mt-8 mb-10 bg-white rounded-2xl
                     border border-gray-200 shadow-sm p-6 self-center"
        >
          {/* Headline */}
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            Create an account
          </Text>
          <Text className="text-gray-500 mb-6">
            Enter your information below to get started
          </Text>

          {/* Names */}
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Input
                placeholder="First name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            <View className="w-4" />
            <View className="flex-1">
              <Input
                placeholder="Last name"
                value={surname}
                onChangeText={setSurname}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <EmailInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Phone */}
          <PhoneNumberInput
            placeholder="+216 12345678"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Birthday */}
          <DateInput
            value={selectedDate}
            placeholder="Birthday"
            onPress={() => setIsBirthdayPickerVisible(true)}
          />

          {/* Call-to-action */}
          <OutlinedButtonSm
            title="Continue"
            onPress={handleSignup}
            extraStyle="mt-2"
          />

          {/* Validation / API error */}
          {errorMessage ? (
            <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
          ) : null}

          {/* Divider */}
          <DividerWithText text="OR" />

          {/* Google sign-in */}
          <GoogleButton
            text="Continue with Google"
            onPress={() => console.log("Google sign-in")}
          />

          {/* Birthday modal */}
          <BirthdayPicker
            isBirthdayPickerVisible={isBirthdayPickerVisible}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setIsBirthdayPickerVisible(false);
            }}
            setIsBirthdayPickerVisible={setIsBirthdayPickerVisible}
          />

          {/* Terms */}
          <Text className="text-gray-500 text-sm text-center mt-4">
            By continuing you agree to our{" "}
          </Text>
          <View className="flex-row justify-center">
            <PressableText
              text="Terms of Service"
              onPress={() => console.log("ToS")}
            />
            <Text className="text-gray-500 text-sm mx-1">and</Text>
            <PressableText
              text="Privacy Policy"
              onPress={() => console.log("PP")}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
