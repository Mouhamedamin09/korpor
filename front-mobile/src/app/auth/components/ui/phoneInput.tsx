import { View, Image } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import type { FC } from "react";

const ArrowDown = require("@assets/arrowDown.png");

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (formattedText: string) => void;
}

const PhoneNumberInput: FC<PhoneNumberInputProps> = ({
  value,
  onChangeText,
}) => {
  return (
    <View className="w-full mb-3">
      <PhoneInput
        placeholder="12 345 678"
        defaultValue={value} // Initialize with the parent's value
        defaultCode="TN" // or "TN", etc.
        onChangeFormattedText={(text) => {
          onChangeText(text);
        }}
        containerStyle={{
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 12,
          backgroundColor: "#FFF",
          height: 48,
          width: "100%",
        }}
        flagButtonStyle={{
          marginRight: -5,
          marginLeft: 12,
        }}
        textContainerStyle={{
          paddingHorizontal: 2,
          paddingVertical: 1,
          backgroundColor: "#FFF",
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        }}
        textInputStyle={{
          fontSize: 16,
          color: "#000",
        }}
        textInputProps={{
          placeholderTextColor: "#A0A0A0",
        }}
        renderDropdownImage={
          <View className="flex-row items-center justify-center">
            <Image source={ArrowDown} className="w-[12px] h-[12px]" />
            <View className="w-[1px] bg-border mx-2 h-12" />
          </View>
        }
      />
    </View>
  );
};

export default PhoneNumberInput;
