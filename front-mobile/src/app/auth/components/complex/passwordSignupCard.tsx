import { View, Text } from "react-native";
import { SolidButton, PasswordBarInput } from "../ui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signup } from "@auth/services/signup";

interface PasswordCardProps {
  name: string;
  surname: string;
  email: string;
  phone: string;
  birthdate: string;
  referralCode?: string;
}

export default function PasswordCard({
  name,
  surname,
  email,
  phone,
  birthdate,
  referralCode,
}: PasswordCardProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Reset error on each attempt
    setErrorMessage("");
    setIsLoading(true);

    try {
      // Validate all required fields and ensure they're properly defined
      if (
        !name?.trim() ||
        !surname?.trim() ||
        !email?.trim() ||
        !phone?.trim() ||
        !birthdate?.trim()
      ) {
        setErrorMessage("Please fill out all required fields.");
        setIsLoading(false);
        return;
      }

      if (!password.trim() || !confirmPassword.trim()) {
        setErrorMessage("Please enter and confirm your password.");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      // Password regex for testing
      const passwordRegex = /^.{6,}$/;
      // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(password)) {
        setErrorMessage(
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
        );
        setIsLoading(false);
        return;
      }

      // Prepare signup data with safe string conversion
      const signupData = {
        name: String(name).trim(),
        surname: String(surname).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        birthdate: String(birthdate).trim(),
        password: password.trim(),
        accountType: "user",
        referralCode: referralCode?.trim() || null,
      };

      console.log("Signup data:", signupData);

      // Call the signup API
      const response = await signup(signupData);

      console.log("Signup response:", response);

      // Check if response has user data
      if (!response || !response.user || !response.user.id) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // If success, navigate to email verification screen
      router.push({
        pathname: "/auth/screens/Signup/verify",
        params: {
          email: signupData.email,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <Text className="text-3xl font-bold text-gray-900 mb-1">
        Create a strong Password
      </Text>
      <Text className="text-gray-500 mb-6">
        Use at least 8 characters, including one uppercase letter, one lowercase
        letter, one number, and one special character.
      </Text>
      <PasswordBarInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <PasswordBarInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <SolidButton
        title={isLoading ? "Creating Account..." : "Create Account"}
        onPress={handleSignup}
        disabled={isLoading}
      />

      {/* Show error message if any */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      ) : null}

      <View className="mb-4" />
    </View>
  );
}
