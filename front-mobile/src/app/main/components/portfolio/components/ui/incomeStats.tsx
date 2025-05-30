// components/ui/IncomeStats.tsx
import React from "react";
import { View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";

const GREEN = "#34D37D";

interface Props {
  years: number;
  projectedValue: number;
  monthlyIncome: number;
}

const IncomeStats: React.FC<Props> = ({
  years,
  projectedValue,
  monthlyIncome,
}) => {
  return (
    <View className="flex-row mb-6">
      <Card extraStyle="flex-1 mr-2 p-4">
        <Feather name="bar-chart-2" size={24} color={GREEN} />
        <Text className="text-sm text-gray-500 mt-2">
          Value after {years} year{years > 1 ? "s" : ""}
        </Text>
        <Text className="text-lg font-bold text-gray-900">
          TND {projectedValue.toLocaleString()}
        </Text>
      </Card>

      <Card extraStyle="flex-1 ml-2 p-4">
        <Feather name="dollar-sign" size={24} color={GREEN} />
        <Text className="text-sm text-gray-500 mt-2">Monthly income</Text>
        <Text className="text-lg font-bold text-gray-900">
          TND {monthlyIncome.toLocaleString()}
        </Text>
      </Card>
    </View>
  );
};

export default IncomeStats;
