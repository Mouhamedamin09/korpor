import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import * as Progress from "react-native-progress";

import TopBar from "@/app/main/components/profileScreens/components/ui/TopBar";
import {
  getInvestmentDetails,
  formatCurrency,
  InvestmentDetails,
} from "@/app/main/services/realEstateInvestment";

const InvestmentDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [investmentData, setInvestmentData] =
    useState<InvestmentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvestmentDetails();
    }
  }, [id]);

  const loadInvestmentDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getInvestmentDetails(parseInt(id));
      setInvestmentData(data);
    } catch (error) {
      console.error("Failed to load investment details:", error);
      Alert.alert(
        "Error",
        "Failed to load investment details. Please try again."
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopBar title="Investment Details" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-lg text-gray-600">
            Loading investment details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!investmentData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopBar title="Investment Details" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center p-6">
          <Feather name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">
            Investment Not Found
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            The investment you're looking for could not be found.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-green-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { investment, property, transaction } = investmentData;
  const progressValue = (property.totalInvested / property.goal_amount) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      case "cancelled":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "check-circle";
      case "pending":
        return "clock";
      case "failed":
        return "x-circle";
      case "cancelled":
        return "minus-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TopBar title="Investment Details" onBackPress={() => router.back()} />

      <ScrollView className="flex-1 p-4">
        {/* Investment Status */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-800">
              Investment Details
            </Text>
            <View className="flex-row items-center">
              <Feather
                name={getStatusIcon(investment.status)}
                size={20}
                color={
                  investment.status === "confirmed" ? "#10b981" : "#f59e0b"
                }
              />
              <Text
                className={`ml-2 font-semibold capitalize ${getStatusColor(
                  investment.status
                )}`}
              >
                {investment.status}
              </Text>
            </View>
          </View>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Investment Amount</Text>
              <Text className="font-bold text-xl text-green-600">
                {formatCurrency(investment.amount, investment.currency)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Your Share</Text>
              <Text className="font-semibold">
                {investment.userShare.toFixed(2)}%
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment Method</Text>
              <Text className="font-semibold capitalize">
                {investment.paymentMethod}
              </Text>
            </View>

            {investment.investmentDate && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Investment Date</Text>
                <Text className="font-semibold">
                  {new Date(investment.investmentDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Property Information */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-xl font-semibold mb-4">
            Property Information
          </Text>

          <Text className="text-lg font-bold text-gray-800 mb-2">
            {property.name}
          </Text>
          <Text className="text-gray-600 mb-4">{property.location}</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Funding Progress</Text>
            <Text className="font-semibold">{progressValue.toFixed(1)}%</Text>
          </View>

          <Progress.Bar
            progress={progressValue / 100}
            width={null}
            height={8}
            color="#10B981"
            unfilledColor="#e5e7eb"
            borderRadius={4}
            className="mb-4"
          />

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Property Type</Text>
              <Text className="font-semibold capitalize">
                {property.property_type}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Expected ROI</Text>
              <Text className="font-semibold">{property.expected_roi}%</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Rental Yield</Text>
              <Text className="font-semibold">{property.rental_yield}%</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Investors</Text>
              <Text className="font-semibold">{property.investorCount}</Text>
            </View>
          </View>
        </View>

        {/* Returns Information */}
        <View className="bg-green-50 rounded-xl border border-green-200 p-4 mb-4">
          <Text className="text-xl font-semibold text-green-800 mb-4">
            Expected Returns
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-green-700">Estimated Monthly Return</Text>
              <Text className="font-bold text-green-800">
                {formatCurrency(
                  investment.estimatedMonthlyReturn,
                  investment.currency
                )}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-green-700">Estimated Annual Return</Text>
              <Text className="font-bold text-green-800">
                {formatCurrency(
                  investment.estimatedMonthlyReturn * 12,
                  investment.currency
                )}
              </Text>
            </View>

            <View className="bg-green-100 rounded-lg p-3 mt-2">
              <Text className="text-green-800 text-sm text-center">
                * Returns are estimates based on property performance and market
                conditions
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        {transaction && (
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text className="text-xl font-semibold mb-4">
              Transaction Details
            </Text>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Transaction ID</Text>
                <Text className="font-semibold">#{transaction.id}</Text>
              </View>

              {transaction.reference && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Reference</Text>
                  <Text className="font-semibold">{transaction.reference}</Text>
                </View>
              )}

              {transaction.processedAt && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Processed At</Text>
                  <Text className="font-semibold">
                    {new Date(transaction.processedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity
            onPress={() =>
              router.push(`/main/components/propertyScreens/${property.id}`)
            }
            className="bg-green-600 py-4 rounded-lg flex-row items-center justify-center"
          >
            <Feather name="home" size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              View Property
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/main/screens/(tabs)/portfolio")}
            className="bg-gray-100 py-4 rounded-lg flex-row items-center justify-center"
          >
            <Feather name="pie-chart" size={20} color="#374151" />
            <Text className="text-gray-700 font-semibold text-lg ml-2">
              View Portfolio
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvestmentDetailsScreen;
