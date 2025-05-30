import { View, TextInput, Text } from "react-native";
import { Plus, Minus } from "@main/components/ui/index";
import { OutlinedButton } from "@auth/components/ui/index";
import { useStepperValue } from "@main/hooks/useStepperValue";

type StepperWithButtonProps = {
  min: number;
  max: number;
};

export default function StepperWithButton({
  min,
  max,
}: StepperWithButtonProps) {
  const { value, increase, decrease, changeManually } = useStepperValue({
    initialValue: min,
    minValue: min,
    maxValue: max,
  });

  return (
    <View className="border border-zinc-200 self-center rounded-xl py-2 w-[100%]">
      <Text className="self-center font-bold text-medium">
        Initial Investment
      </Text>
      <View className="flex-row justify-between px-10 items-center">
        <Minus onPress={decrease} />

        <View className="items-center">
          <TextInput
            value={value.toString()}
            onChangeText={changeManually}
            keyboardType="numeric"
            className="text-7xl font-bold text-center mb-[-20]"
          />
          <Text className="text-zinc-500">TND</Text>
        </View>

        <Plus onPress={increase} />
      </View>

      <View className="w-[80%] self-center mt-4">
        <OutlinedButton
          title="Add to Cart"
          onPress={() => {
            console.log("cart pressed with value:", value);
          }}
        />
      </View>
    </View>
  );
}
