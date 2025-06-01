import { View, TextInput } from "react-native";

export default function Input({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View>
      <TextInput
        className="border border-border rounded-xl px-4 h-12 text-base text-text w-full py-3 bg-background mb-3"
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        multiline={false}
        value={value}
        onChangeText={onChangeText} // Capture input
      />
    </View>
  );
}
