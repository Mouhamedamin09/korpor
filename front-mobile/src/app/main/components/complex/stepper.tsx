import { View, TextInput, Text } from "react-native";
import { useState } from "react";
import { Plus, Minus } from "@main/components/ui/index";

export default function Stepper() {
  const [value, setValue] = useState(250);
  const MIN = 50;
  const MAX = 5999;

  const clampValue = (val: number) => Math.min(Math.max(val, MIN), MAX);

  const handleChange = (text: string) => {
    const numericValue = parseInt(text, 10);
    if (!isNaN(numericValue)) {
      setValue(clampValue(numericValue));
    } else if (text === "") {
      setValue(MIN); // or leave blank if preferred
    }
  };

  return (
    <View className="flex-row justify-between py-2 px-10 items-center bg-white rounded-xl border border-zinc-200 w-[94%] self-center">
      <Minus onPress={() => setValue((prev) => clampValue(prev - 10))} />

      <View className="items-center">
        <TextInput
          value={value.toString()}
          onChangeText={handleChange}
          keyboardType="numeric"
          className="text-7xl font-bold text-center mb-[-12]"
        />
        <Text className="text-zinc-500">Tunisian Dinar</Text>
      </View>

      <Plus onPress={() => setValue((prev) => clampValue(prev + 10))} />
    </View>
  );
}
