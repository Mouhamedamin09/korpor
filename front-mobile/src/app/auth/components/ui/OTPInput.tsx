import React, { useRef } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

interface OTPInputProps {
  otp: string[]; // code state from parent  →   ["", "", …]
  setOtp: (o: string[]) => void;
}

/**
 *  Tailwind sizing helpers (NativeWind):
 *  - w-12  → 48 px
 *  - h-14  → 56 px
 *  - gap-x-3 → 12 px
 */
export default function OTPInput({ otp, setOtp }: OTPInputProps) {
  const numInputs = otp.length;
  const inputs = useRef<(TextInput | null)[]>([]);

  /* ────────────── helpers ────────────── */

  /** Handles normal typing AND full-code paste */
  const handleChange = (text: string, idx: number) => {
    // If user pasted or keyboard autocomplete inserted > 1 char
    if (text.length > 1) {
      const chars = text.split("");
      const nextOtp = [...otp];

      /* fill starting from current index */
      for (let i = 0; i < chars.length && idx + i < numInputs; i++) {
        nextOtp[idx + i] = chars[i];
      }
      setOtp(nextOtp);

      /* focus first empty cell if any */
      const firstEmpty = nextOtp.findIndex((c) => c === "");
      if (firstEmpty !== -1) inputs.current[firstEmpty]?.focus();
      else inputs.current[numInputs - 1]?.blur(); // done

      return;
    }

    /* single-char entry */
    const nextOtp = [...otp];
    nextOtp[idx] = text;
    setOtp(nextOtp);

    if (text && idx < numInputs - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  /** Backspace on empty cell → jump back */
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && otp[idx] === "" && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  /* ────────────── render ────────────── */

  return (
    <View className="flex-row justify-center ">
      {otp.map((digit, idx) => (
        <TextInput
          key={idx}
          value={digit}
          ref={(r) => (inputs.current[idx] = r)}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(t) => handleChange(t, idx)}
          onKeyPress={(e) => handleKeyPress(e, idx)}
          className="
            w-12 h-14 ml-2 text-center text-xl font-semibold text-gray-900
            border border-gray-300 rounded-xl bg-white
            shadow-sm"
        />
      ))}
    </View>
  );
}
