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
  Input,
  DateInput,
  PhoneNumberInput,
  EmailInput,
  PressableText,
  OutlinedButtonSm,
} from "../ui";
import BirthdayPicker from "./birthdaypicker";

export default function ClerkSignupCard() {
  const router = useRouter();

  const [isBirthdayPickerVisible, setIsBirthdayPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,4}\s?\d{4,}$/;

  const handleSignup = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const trimmed = {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone.trim(),
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

      // Navigate to password setup with user data
      router.push({
        pathname: "/auth/screens/Signup/clerkPassword",
        params: trimmed,
      });
    } catch (error: any) {
      console.error("Signup preparation error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Create an account
          </Text>
          <Text className="text-gray-500 mb-8 text-center">
            Enter your information below to get started
          </Text>

          <View className="mt-4">
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
              onPress={() => {
                if (!isLoading) {
                  setIsBirthdayPickerVisible(true);
                }
              }}
            />

            <Input
              placeholder="Referral Code (Optional)"
              value={referralCode}
              onChangeText={setReferralCode}
            />

            <View className="mt-4">
              <OutlinedButtonSm
                title="Continue"
                onPress={() => {
                  if (!isLoading) {
                    handleSignup();
                  }
                }}
              />
            </View>

            {errorMessage ? (
              <Text className="text-red-500 text-sm mt-3 text-center">
                {errorMessage}
              </Text>
            ) : null}
          </View>

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

          <View className="mt-6">
            <Text className="text-gray-500 text-sm text-center">
              By continuing you agree to our{" "}
            </Text>
            <View className="flex-row justify-center mt-1">
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
