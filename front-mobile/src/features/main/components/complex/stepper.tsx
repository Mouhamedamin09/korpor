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
    <View className="flex-row bg-white w-36 mt-4">
      <View className="flex-1">
        <Minus onPress={() => setValue((prev) => clampValue(prev - 10))} />
      </View>

      <View className="items-center flex-1 mx-auto">
        <TextInput
          value={value.toString()}
          onChangeText={handleChange}
          keyboardType="numeric"
          className="text-xl font-bold flex-1"
        />
        <Text className="text-zinc-500 text-xs">TND</Text>
      </View>
      <View className="flex-1 items-end">
        <Plus onPress={() => setValue((prev) => clampValue(prev + 10))} />
      </View>
    </View>
  );
}
