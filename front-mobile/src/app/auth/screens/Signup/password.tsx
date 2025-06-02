import { View, Text, Image, TouchableOpacity } from "react-native";
import { PasswordCard } from "@auth/components/complex";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

const BackButton = require("@assets/back.png");
const Lock = require("@assets/lock.png");

export default function PasswordSignupInput() {
  const router = useRouter();
  // These are the params passed from the first step (SignupCard)
  const { name, surname, email, phone, birthdate } = useLocalSearchParams();

  // Log received parameters for debugging
  useEffect(() => {
    console.log("Password screen received params:", {
      name,
      surname,
      email,
      phone,
      birthdate,
      name_type: typeof name,
      surname_type: typeof surname,
      email_type: typeof email,
      phone_type: typeof phone,
      birthdate_type: typeof birthdate,
    });
  }, [name, surname, email, phone, birthdate]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        className="mt-2"
      >
        <Image source={BackButton} className="h-12 w-12" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center">
        <Image source={Lock} className="w-20 h-20 mb-10 mt-[-40%]" />

        {/* PasswordCard now needs to know the user's name/surname/email/phone/birthdate */}
        <PasswordCard
          name={name as string}
          surname={surname as string}
          email={email as string}
          phone={phone as string}
          birthdate={birthdate as string}
        />
      </View>
    </View>
  );
}
