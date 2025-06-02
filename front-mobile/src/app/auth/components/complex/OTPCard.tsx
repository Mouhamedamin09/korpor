import { View, Text } from "react-native";
import { SolidButton, OTPInput, PressableText } from "../ui";
import { useRouter } from "expo-router";
import { verifySignUp } from "@auth/services/signup";
import { useState } from "react";

interface OTPCardProps {
  email: string;
  userId: string;
}

export default function OTPCard({ email, userId }: OTPCardProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    // Reset error message on each attempt
    setErrorMessage("");
    setIsLoading(true);

    const code = otp.join(""); // e.g. ["1","2","3","4"] => "1234"
    if (code.length < 4) {
      setErrorMessage("Please enter the 4-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Verifying email with:", { email, code });
      await verifySignUp(email, code);
      console.log("Email verification successful");

      // If successful, route to phone verification screen
      router.push({
        pathname: "/auth/screens/Signup/verifyPhone",
        params: { userId },
      });
    } catch (error: any) {
      console.error("Email verification error:", error);

      // Handle different types of errors
      let errorMessage = "Verification failed. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.log("Setting error message:", errorMessage);
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="w-[90%] h-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <Text className="text-3xl font-bold text-gray-900 mb-1">
        Verify Your Email
      </Text>
      <Text className="text-gray-500 mb-6">
        We've sent a 4-digit code to {email}. Enter it below to continue.
      </Text>

      <View className="items-center mb-3">
        <OTPInput otp={otp} setOtp={setOtp} />
      </View>

      <SolidButton
        title={isLoading ? "Verifying..." : "Verify Email"}
        onPress={handleVerify}
        disabled={isLoading}
      />

      {/* Show error message if any */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
      ) : null}

      <View className="flex-row justify-center items-center pt-4 mb-3">
        <Text className="text-gray-500 text-sm font-medium">
          Didn't receive any code?
        </Text>
        <PressableText
          text=" Resend Code"
          onPress={() => {
            // Optionally call an endpoint to resend the code
            console.log("Resend Code pressed");
          }}
        />
      </View>
    </View>
  );
}
