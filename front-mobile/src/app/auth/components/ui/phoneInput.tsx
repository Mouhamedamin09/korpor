import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import React, { useState } from "react";
import type { FC } from "react";

// Common country codes with their flags and dial codes
const COUNTRIES = [
  { code: "US", flag: "🇺🇸", dialCode: "+1", name: "United States" },
  { code: "TN", flag: "🇹🇳", dialCode: "+216", name: "Tunisia" },
  { code: "FR", flag: "🇫🇷", dialCode: "+33", name: "France" },
  { code: "GB", flag: "🇬🇧", dialCode: "+44", name: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", dialCode: "+49", name: "Germany" },
  { code: "IT", flag: "🇮🇹", dialCode: "+39", name: "Italy" },
  { code: "ES", flag: "🇪🇸", dialCode: "+34", name: "Spain" },
  { code: "CA", flag: "🇨🇦", dialCode: "+1", name: "Canada" },
  { code: "AU", flag: "🇦🇺", dialCode: "+61", name: "Australia" },
  { code: "JP", flag: "🇯🇵", dialCode: "+81", name: "Japan" },
  { code: "KR", flag: "🇰🇷", dialCode: "+82", name: "South Korea" },
  { code: "CN", flag: "🇨🇳", dialCode: "+86", name: "China" },
  { code: "IN", flag: "🇮🇳", dialCode: "+91", name: "India" },
  { code: "BR", flag: "🇧🇷", dialCode: "+55", name: "Brazil" },
  { code: "MX", flag: "🇲🇽", dialCode: "+52", name: "Mexico" },
  { code: "AR", flag: "🇦🇷", dialCode: "+54", name: "Argentina" },
  { code: "RU", flag: "🇷🇺", dialCode: "+7", name: "Russia" },
  { code: "SA", flag: "🇸🇦", dialCode: "+966", name: "Saudi Arabia" },
  { code: "AE", flag: "🇦🇪", dialCode: "+971", name: "United Arab Emirates" },
  { code: "EG", flag: "🇪🇬", dialCode: "+20", name: "Egypt" },
];

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (formattedText: string) => void;
}

const PhoneNumberInput: FC<PhoneNumberInputProps> = ({
  value,
  onChangeText,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to Tunisia
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Extract phone number from the full value if it includes country code
  React.useEffect(() => {
    if (value && value.startsWith(selectedCountry.dialCode)) {
      const numberPart = value
        .substring(selectedCountry.dialCode.length)
        .trim();
      setPhoneNumber(numberPart);
    } else if (value && !value.includes("+")) {
      setPhoneNumber(value);
    }
  }, [value, selectedCountry.dialCode]);

  const handlePhoneNumberChange = (text: string) => {
    // Remove any non-digit characters except spaces and hyphens
    const cleanedText = text.replace(/[^\d\s-]/g, "");
    setPhoneNumber(cleanedText);

    // Format the complete phone number
    const formattedNumber = `${selectedCountry.dialCode} ${cleanedText}`.trim();
    onChangeText(formattedNumber);
  };

  const selectCountry = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);

    // Update the formatted number with new country code
    const formattedNumber = `${country.dialCode}${phoneNumber}`.trim();
    onChangeText(formattedNumber);
  };

  const renderCountryItem = ({ item }: { item: (typeof COUNTRIES)[0] }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => selectCountry(item)}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-base text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View className="w-full mb-3">
        <View className="flex-row border border-border rounded-xl bg-background overflow-hidden h-12">
          {/* Country Selector */}
          <TouchableOpacity
            className="flex-row items-center px-3 justify-center border-r border-border bg-background"
            onPress={() => setShowCountryPicker(true)}
            style={{ minWidth: 90 }}
          >
            <Text className="text-lg mr-1">{selectedCountry.flag}</Text>
            <Text className="text-sm text-text mr-1">
              {selectedCountry.dialCode}
            </Text>
            <Text className="text-gray-400 text-xs">▼</Text>
          </TouchableOpacity>

          {/* Phone Number Input */}
          <TextInput
            className="flex-1 px-3 pb-2 text-base text-text bg-background"
            placeholder="12 345 678"
            placeholderTextColor="#A0A0A0"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            autoComplete="tel"
            style={{ height: 48 }}
          />
        </View>
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                className="px-4 py-2"
              >
                <Text className="text-black text-base font-medium">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Country List */}
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PhoneNumberInput;
