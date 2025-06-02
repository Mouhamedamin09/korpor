import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface ReinvestAmountSetupProps {
  percentage: number;
  setPercentage: (percentage: number) => void;
}

const ReinvestAmountSetup: React.FC<ReinvestAmountSetupProps> = ({
  percentage,
  setPercentage,
}) => {
  const [customInput, setCustomInput] = useState(false);
  const [inputValue, setInputValue] = useState(percentage.toString());

  const presetPercentages = [25, 50, 75, 100];

  const handlePresetSelect = (value: number) => {
    setCustomInput(false);
    setPercentage(value);
    setInputValue(value.toString());
  };

  const handleCustomInputChange = (text: string) => {
    setInputValue(text);
    const numValue = parseInt(text) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setPercentage(numValue);
    }
  };

  const handleCustomInputToggle = () => {
    setCustomInput(!customInput);
    if (!customInput) {
      setInputValue(percentage.toString());
    }
  };

  return (
    <View className="flex-1 px-4">
      {/* Header */}
      <View className="items-center mb-8 mt-10">
        <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
          <Feather name="percent" size={28} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Set Reinvestment Percentage
        </Text>
        <Text className="text-gray-600 text-center">
          Choose what percentage of your rental income to automatically reinvest
        </Text>
      </View>

      {/* Current Selection Display */}
      <View className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <Text className="text-center text-sm text-gray-600 mb-2">
          Current Selection
        </Text>
        <Text className="text-center text-4xl font-bold text-green-600">
          {percentage}%
        </Text>
        <Text className="text-center text-sm text-gray-500 mt-2">
          of rental income will be reinvested
        </Text>
      </View>

      {/* Preset Options */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Quick Select
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {presetPercentages.map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => handlePresetSelect(value)}
              className={`w-[22%] h-16 rounded-lg border-2 items-center justify-center mb-3 ${
                percentage === value && !customInput
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-lg font-semibold ${
                  percentage === value && !customInput
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {value}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Input */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={handleCustomInputToggle}
          className={`flex-row items-center justify-between p-4 rounded-lg border-2 ${
            customInput
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Feather
              name="edit-3"
              size={20}
              color={customInput ? "#10B981" : "#6B7280"}
            />
            <Text
              className={`ml-3 font-medium ${
                customInput ? "text-green-600" : "text-gray-700"
              }`}
            >
              Custom Percentage
            </Text>
          </View>
          <Feather
            name={customInput ? "chevron-up" : "chevron-down"}
            size={20}
            color={customInput ? "#10B981" : "#6B7280"}
          />
        </TouchableOpacity>

        {customInput && (
          <View className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-sm text-gray-600 mb-2">
              Enter percentage (1-100%)
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={inputValue}
                onChangeText={handleCustomInputChange}
                className="flex-1 h-12 px-3 bg-white border border-gray-300 rounded-lg text-lg font-medium"
                placeholder="Enter percentage"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text className="ml-2 text-lg font-medium text-gray-600">%</Text>
            </View>
            {parseInt(inputValue) > 100 && (
              <Text className="text-red-500 text-sm mt-2">
                Percentage cannot exceed 100%
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ReinvestAmountSetup;
