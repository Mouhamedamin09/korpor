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
  // Keep phone in state — do NOT send to the backend
  const [phone, setPhone] = useState("");

  // We'll store any error messages here
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = () => {
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !name.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !selectedDate.trim()
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      router.push({
        pathname: "/auth/screens/Signup/password",
        params: {
          name,
          surname,
          email,
          birthdate: selectedDate,
        },
      });
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <View>
      <View className="w-[90%] h-auto bg-background rounded-2xl border border-border p-5 shadow">
        {/* Name / Surname */}
        <Text className="text-3xl font-bold text-text mb-1 ml-1">
          Create an account
        </Text>
        <Text className="ml-1 text-[#a1a1aa] mb-6">
          Enter your information below to create your account
        </Text>
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

        {/* Birthdate */}
        <DateInput
          value={selectedDate}
          placeholder="Select birthday"
          onPress={() => setIsBirthdayPickerVisible(true)}
        />

        {/* Phone number (stored locally but not sent to API) */}
        <PhoneNumberInput value={phone} onChangeText={setPhone} />

        <OutlinedButtonSm title="Sign up" onPress={handleSignup} />

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

        <Text className="text-[#a1a1aa] text-small text-center mt-4">
          By clicking signup, you agree to our{" "}
        </Text>
        <View className="flex-row align-middle justify-center">
          <PressableText
            text="Terms of Service"
            onPress={() => {
              console.log("ToS clicked");
            }}
          />
          <Text className="text-[#a1a1aa] mb-4 text-small text-center">
            {" "}
            and{" "}
          </Text>
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
