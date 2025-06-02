import { View, Text } from "react-native";
import { SolidButton, PasswordInput } from "../ui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signupUser } from "@auth/services/signup";

interface PasswordCardProps {
  name: string;
  surname: string;
  email: string;
  birthdate: string;
}

export default function PasswordCard({
  name,
  surname,
  email,
  birthdate,
}: PasswordCardProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    // Reset error on each attempt
    setErrorMessage("");

    // Validate fields
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // We pass everything EXCEPT phone to the backend
      const response = await signupUser({
        name,
        surname,
        email,
        birthdate,
        password,
      });

      console.log("Signup response:", response);

      // Check if response has user data
      if (!response || !response.user || !response.user.id) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // If success, navigate to verification screen
      router.push({
        pathname: "/auth/screens/Signup/verify",
        params: {
          email,
          userId: response.user.id.toString(),
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle different types of errors
      let errorMessage = "Sign up failed. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
    }
  };

  return (
    <View className="w-[90%] h-auto bg-[#09090b] rounded-2xl border border-[#3f3f46] p-5">
      <Text className="text-4xl ml-1 font-bold text-[#F0F4FA] w-[80%]">
        Create a strong Password
      </Text>
      <Text className="text-[#F0F4FA] mb-6 ml-1 text-small w-[80%]">
        Use at least 8 characters, including one uppercase letter, one lowercase
        letter, one number, and one special character.
      </Text>
      <PasswordInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <PasswordInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <SolidButton title="Set Password & Continue" onPress={handleSignup} />

      {/* Show error message if any */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      ) : null}

      <View className="mb-4" />
    </View>
  );
}
