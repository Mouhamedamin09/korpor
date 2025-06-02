import React, { useRef } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

interface OTPInputProps {
  otp: string[];
  setOtp: (newOtp: string[]) => void;
}

export default function OTPInput({ otp, setOtp }: OTPInputProps): JSX.Element {
  const numInputs = otp.length; // Dynamic length based on otp array
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only take the last character if user typed more than one
    if (text.length > 1) {
      text = text.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to the next input if there's a new character and we're not at the last input
    if (text !== "" && index < numInputs - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // If Backspace on an empty field, go to the previous input
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    /**
     * Container:
     * - dynamic width based on number of inputs
     * - border & rounded corners
     * - background color
     * We use overflow-hidden to ensure the inner borders line up nicely.
     */
    <View
      className="flex-row h-14 py-3 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm"
      style={{ width: numInputs * 50 + 20 }}
    >
      {otp.map((digit, index) => (
        /**
         * Each column:
         * - Fixed width for consistent spacing
         * - Text centered
         * - For every column except the last, we apply a right border
         */
        <TextInput
          key={index}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={1}
          className={`text-center text-gray-900 text-xl ${
            index < numInputs - 1 ? "border-r border-gray-200" : ""
          }`}
          style={{ width: 50 }}
          ref={(ref) => (inputs.current[index] = ref)}
        />
      ))}
    </View>
  );
}
