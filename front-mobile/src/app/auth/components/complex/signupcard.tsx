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

  const [isBirthdayPickerVisible, setIsBirthdayPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,4}\s?\d{4,}$/;

  const handleSignup = () => {
    setErrorMessage("");

    const trimmed = {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim().replace(/\s/g, ""), // 🔧 remove spaces
      birthdate: selectedDate.trim(),
      referralCode: referralCode.trim(),
    };

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

    router.push({
      pathname: "/auth/screens/Signup/password",
      params: trimmed,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
        className="px-4"
      >
        <View className="w-full max-w-[420px] mt-8 mb-10 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 self-center">
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            Create an account
          </Text>
          <Text className="text-gray-500 mb-6">
            Enter your information below to get started
          </Text>

          <View className="flex-row justify-between">
            <View className="flex-1">
              <Input
                placeholder="First name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="w-4" />
            <View className="flex-1">
              <Input
                placeholder="Last name"
                value={surname}
                onChangeText={setSurname}
              />
            </View>
          </View>

          <EmailInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <PhoneNumberInput value={phone} onChangeText={setPhone} />

          <DateInput
            value={selectedDate}
            placeholder="Birthday"
            onPress={() => setIsBirthdayPickerVisible(true)}
          />

          <Input
            placeholder="Referral Code (Optional)"
            value={referralCode}
            onChangeText={setReferralCode}
          />

          <OutlinedButtonSm title="Continue" onPress={handleSignup} />

          {errorMessage ? (
            <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
          ) : null}

          <DividerWithText text="OR" />

          <GoogleButton
            text="Continue with Google"
            onPress={() => console.log("Google sign-in")}
          />

          <BirthdayPicker
            isBirthdayPickerVisible={isBirthdayPickerVisible}
            onSelectDate={(rawDate) => {
              const d = new Date(rawDate);
              d.setDate(d.getDate() + 1);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              const localString = `${year}-${month}-${day}`;
              setSelectedDate(localString);
              setIsBirthdayPickerVisible(false);
            }}
            setIsBirthdayPickerVisible={setIsBirthdayPickerVisible}
          />

          <Text className="text-gray-500 text-sm text-center mt-4">
            By continuing you agree to our{" "}
          </Text>
          <View className="flex-row justify-center">
            <PressableText
              text="Terms of Service"
              onPress={() => console.log("still working on it")}
            />
            <Text className="text-gray-500 text-sm mx-1">and</Text>
            <PressableText
              text="Privacy Policy"
              onPress={() => console.log("still working on it")}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
