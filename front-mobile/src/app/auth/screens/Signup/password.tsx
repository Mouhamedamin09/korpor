// ─────────────────────────────────────────────────────────────────────────────
// /auth/screens/Signup/PasswordSignupInput.tsx
// Uses the new PasswordCard. Hides the big lock icon while the keyboard is up.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Keyboard } from "react-native";
import { PasswordCard } from "@auth/components/complex";
import { useLocalSearchParams, useRouter } from "expo-router";

const BackButton = require("@assets/back.png");
const Lock = require("@assets/lock.png");

export default function PasswordSignupInput() {
  const router = useRouter();

  /* params passed from the first signup step */
  const { name, surname, email, phone, birthdate, referralCode } =
    useLocalSearchParams<{
      name?: string;
      surname?: string;
      email?: string;
      phone?: string;
      birthdate?: string;
      referralCode?: string;
    }>();

  /* hide the top-level lock icon while keyboard is visible */
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      {/* ─── Main content ──────────────────────────────────── */}
      <View className="flex-1 items-center justify-center mt-8">
        {!isKeyboardVisible && (
          <Image
            source={Lock}
            className="w-40 h-40 mb-10 mt-[-40%]"
            resizeMode="contain"
          />
        )}

        <PasswordCard
          name={name as string}
          surname={surname as string}
          email={email as string}
          phone={phone as string}
          birthdate={birthdate as string}
          referralCode={referralCode as string}
        />
      </View>
    </View>
  );
}
