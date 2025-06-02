import { View, Text } from "react-native";
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
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SignupCard() {
  const router = useRouter();
  const [isBirthdayPickerVisible, setIsBirthdayPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // We'll store any error messages here
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = () => {
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Basic international phone format

    // Log all form data for debugging
    console.log("Form data before validation:", {
      name,
      surname,
      email,
      phone,
      selectedDate,
      name_type: typeof name,
      surname_type: typeof surname,
      email_type: typeof email,
      phone_type: typeof phone,
      selectedDate_type: typeof selectedDate,
    });

    if (
      !name.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !selectedDate.trim()
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    try {
      // Prepare navigation params with safe string conversion
      const navigationParams = {
        name: String(name).trim(),
        surname: String(surname).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        birthdate: String(selectedDate).trim(),
      };

      console.log("Navigation params:", navigationParams);

      router.push({
        pathname: "/auth/screens/Signup/password",
        params: navigationParams,
      });
    } catch (error) {
      console.error("Navigation error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <View>
      <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Create an account
        </Text>
        <Text className="text-gray-500 mb-6">
          Enter your information below to create your account
        </Text>

        {/* Name / Surname */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Input
              placeholder="First Name"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View className="w-4" />
          <View className="flex-1">
            <Input
              placeholder="Last Name"
              value={surname}
              onChangeText={setSurname}
            />
          </View>
        </View>

        {/* Email */}
        <EmailInput placeholder="Email" value={email} onChangeText={setEmail} />

        {/* Phone number */}
        <PhoneNumberInput value={phone} onChangeText={setPhone} />

        {/* Birthdate */}
        <DateInput
          value={selectedDate}
          placeholder="Select birthday"
          onPress={() => setIsBirthdayPickerVisible(true)}
        />

        <OutlinedButtonSm title="Continue" onPress={handleSignup} />

        {/* Show error message if any */}
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

        {/* Birthday Picker Modal */}
        <BirthdayPicker
          isBirthdayPickerVisible={isBirthdayPickerVisible}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setIsBirthdayPickerVisible(false);
          }}
          setIsBirthdayPickerVisible={setIsBirthdayPickerVisible}
        />

        <Text className="text-gray-500 text-sm text-center mt-4">
          By clicking continue, you agree to our{" "}
        </Text>
        <View className="flex-row align-middle justify-center">
          <PressableText
            text="Terms of Service"
            onPress={() => {
              console.log("ToS clicked");
            }}
          />
          <Text className="text-gray-500 mb-4 text-sm text-center"> and </Text>
          <PressableText
            text="Privacy Policy"
            onPress={() => {
              console.log("PP clicked");
            }}
          />
        </View>
      </View>
    </View>
  );
}
