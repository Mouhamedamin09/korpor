import React from "react";
import { View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface ExitHistoryCardProps {
  property: string;
  date: string;
  amount: number;
  returnRate: string;
}

const ExitHistoryCard: React.FC<ExitHistoryCardProps> = ({
  property,
  date,
  amount,
  returnRate,
}) => {
  return (
    <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 items-start">
      {/* Icon */}
      <View className="p-2 rounded-full bg-gray-100 items-center justify-center mr-4 mt-1">
        <Feather name="log-out" size={24} color="#10B981" />
      </View>

      {/* Text content */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {property}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">Sold on: {date}</Text>
        <Text className="text-sm text-gray-600 mb-1">
          Amount received: ${amount.toLocaleString()}
        </Text>
        <Text className="text-sm text-green-600 font-medium">
          Return: {returnRate}
        </Text>
      </View>
    </View>
  );
};

export default ExitHistoryCard;
