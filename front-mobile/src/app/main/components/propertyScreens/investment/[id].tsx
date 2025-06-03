import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import * as Progress from "react-native-progress";

import TopBar from "@/app/main/components/profileScreens/components/ui/TopBar";
import {
  getPropertyForInvestment,
  validateInvestment,
  createInvestment,
  formatCurrency,
  validateInvestmentAmount,
  PropertyInvestmentDetails,
} from "@/app/main/services/realEstateInvestment";

type InvestmentRouteProp = RouteProp<
  { Investment: { id: string } },
  "Investment"
>;

// Skeleton Loading Components
const SkeletonBox = ({
  height,
  className = "",
  flex,
}: {
  height: number;
  className?: string;
  flex?: number;
}) => (
  <View
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ height, flex }}
  />
);

const PropertyHeaderSkeleton = () => (
  <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
    <SkeletonBox height={28} flex={0.8} className="mb-2" />
    <SkeletonBox height={16} flex={0.6} className="mb-4" />

    <View className="flex-row justify-between mb-2">
      <SkeletonBox height={16} flex={0.4} />
      <SkeletonBox height={16} flex={0.2} />
    </View>

    <SkeletonBox height={8} flex={1} className="mb-4" />

    <View className="flex-row justify-between">
      <View className="flex-1">
        <SkeletonBox height={14} flex={0.6} className="mb-1" />
        <SkeletonBox height={20} flex={0.8} />
      </View>
      <View className="flex-1 items-end">
        <SkeletonBox height={14} flex={0.7} className="mb-1" />
        <SkeletonBox height={20} flex={0.6} />
      </View>
    </View>
  </View>
);

const WalletBalanceSkeleton = () => (
  <View className="bg-gray-100 rounded-xl border border-gray-200 p-4 mb-4">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
        <SkeletonBox height={18} flex={0.5} className="ml-3" />
      </View>
      <SkeletonBox height={24} flex={0.4} />
    </View>
  </View>
);

const InvestmentAmountSkeleton = () => (
  <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
    <SkeletonBox height={24} flex={0.6} className="mb-4" />

    <View className="mb-4">
      <SkeletonBox height={14} flex={0.5} className="mb-2" />
      <View className="border border-gray-300 rounded-lg p-3">
        <SkeletonBox height={18} flex={0.4} />
      </View>
    </View>
  </View>
);

const PaymentMethodSkeleton = () => (
  <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
    <SkeletonBox height={24} flex={0.5} className="mb-4" />

    <View className="flex-row items-center justify-between p-3 rounded-lg border border-gray-300">
      <View className="flex-row items-center flex-1">
        <View className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
        <SkeletonBox height={16} flex={0.4} className="ml-3" />
      </View>
      <View className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
    </View>
  </View>
);

const InvestmentScreenSkeleton = () => (
  <SafeAreaView className="flex-1 bg-gray-50">
    <TopBar title="Invest Now" onBackPress={() => router.back()} />

    <ScrollView className="flex-1 p-4">
      <PropertyHeaderSkeleton />
      <WalletBalanceSkeleton />
      <InvestmentAmountSkeleton />
      <PaymentMethodSkeleton />
    </ScrollView>

    <View className="p-4 bg-white border-t border-gray-200">
      <View className="w-full h-14 bg-gray-200 rounded-lg animate-pulse" />
    </View>
  </SafeAreaView>
);

const InvestmentScreen = () => {
  const { params } = useRoute<InvestmentRouteProp>();
  const { id } = params;

  const [propertyData, setPropertyData] =
    useState<PropertyInvestmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "card" | "bank_transfer"
  >("wallet");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    // Defer API call to next tick to allow skeleton to render first
    const timer = setTimeout(() => {
      loadPropertyData();
    }, 50);

    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (investmentAmount && propertyData) {
      validateAmount();
    }
  }, [investmentAmount, propertyData]);

  const loadPropertyData = async () => {
    try {
      const data = await getPropertyForInvestment(parseInt(id));
      setPropertyData(data);
    } catch (error) {
      console.error("Failed to load property data:", error);
      Alert.alert(
        "Error",
        "Failed to load property details. Please try again."
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = () => {
    if (!propertyData || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) {
      setValidationErrors(["Please enter a valid amount"]);
      return;
    }

    const validation = validateInvestmentAmount(
      amount,
      propertyData.property.minimumInvestment,
      propertyData.wallet.balance,
      propertyData.property.remainingAmount
    );

    setValidationErrors(validation.errors);
  };

  const handleInvest = async () => {
    if (!propertyData || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || validationErrors.length > 0) {
      Alert.alert("Invalid Amount", "Please fix the validation errors first.");
      return;
    }

    try {
      setIsValidating(true);

      await validateInvestment(parseInt(id), amount, paymentMethod);

      setIsValidating(false);
      setIsInvesting(true);

      const result = await createInvestment({
        projectId: parseInt(id),
        amount,
        paymentMethod,
      });

      Alert.alert(
        "Investment Successful!",
        `You have successfully invested ${formatCurrency(
          amount,
          result.investment.currency
        )} in ${
          propertyData.property.name
        }. Your new wallet balance is ${formatCurrency(
          result.transaction?.newBalance || 0,
          result.investment.currency
        )}.`,
        [
          {
            text: "View Investment",
            onPress: () =>
              router.replace(
                `/main/components/portfolio/screens/investment-details?id=${result.investment.id}`
              ),
          },
          {
            text: "View Portfolio",
            onPress: () =>
              router.replace("/main/components/portfolio/screens/investments"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Investment failed:", error);
      Alert.alert(
        "Investment Failed",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsValidating(false);
      setIsInvesting(false);
    }
  };

  // Show skeleton immediately while loading
  if (loading) {
    return <InvestmentScreenSkeleton />;
  }

  if (!propertyData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopBar title="Invest Now" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center p-6">
          <Feather name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">
            Property Not Available
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            This property is not available for investment at the moment.
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

  const { property, investment, wallet } = propertyData;
  const progressValue = property.investmentProgress / 100;

  const formatPercentage = (value: number): string =>
    Number(value || 0).toFixed(1);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TopBar title="Invest Now" onBackPress={() => router.back()} />

      <ScrollView className="flex-1 p-4">
        {/* Property Header */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {property.name}
          </Text>
          <Text className="text-gray-600 mb-4">{property.location}</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Funding Progress</Text>
            <Text className="font-semibold">
              {formatPercentage(property.investmentProgress)}%
            </Text>
          </View>

          <Progress.Bar
            progress={progressValue}
            width={null}
            height={8}
            color="#22c55e"
            unfilledColor="#e5e7eb"
            borderRadius={4}
            className="mb-4"
          />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-600">Remaining</Text>
              <Text className="font-bold text-lg">
                {formatCurrency(property.remainingAmount, wallet.currency)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-600">Expected ROI</Text>
              <Text className="font-bold text-lg text-green-600">
                {formatPercentage(property.expectedRoi)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Balance */}
        <View className="bg-green-50 rounded-xl border border-green-200 p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Feather name="credit-card" size={24} color="#059669" />
              <Text className="ml-3 text-lg font-semibold text-green-800">
                Wallet Balance
              </Text>
            </View>
            <Text className="text-2xl font-bold text-green-800">
              {formatCurrency(wallet.balance, wallet.currency)}
            </Text>
          </View>
        </View>

        {/* Investment Amount */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-xl font-semibold mb-4">Investment Amount</Text>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">
              Minimum:{" "}
              {formatCurrency(property.minimumInvestment, wallet.currency)}
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
              <TextInput
                value={investmentAmount}
                onChangeText={setInvestmentAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                className="flex-1 text-lg font-semibold"
              />
              <Text className="text-gray-600 ml-2">{wallet.currency}</Text>
            </View>
          </View>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <View className="bg-red-50 rounded-lg p-3 mb-4">
              {validationErrors.map((error, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <Feather name="alert-circle" size={16} color="#dc2626" />
                  <Text className="ml-2 text-red-600">{error}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-xl font-semibold mb-4">Payment Method</Text>

          <TouchableOpacity
            onPress={() => setPaymentMethod("wallet")}
            className={`flex-row items-center justify-between p-3 rounded-lg border ${
              paymentMethod === "wallet"
                ? "border-green-500 bg-green-50"
                : "border-gray-300"
            }`}
          >
            <View className="flex-row items-center">
              <Feather
                name="credit-card"
                size={20}
                color={paymentMethod === "wallet" ? "#059669" : "#6b7280"}
              />
              <Text
                className={`ml-3 font-semibold ${
                  paymentMethod === "wallet"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                Wallet Payment
              </Text>
            </View>
            {paymentMethod === "wallet" && (
              <Feather name="check-circle" size={20} color="#059669" />
            )}
          </TouchableOpacity>
        </View>

        {/* Investment Summary */}
        {investmentAmount &&
          !isNaN(parseFloat(investmentAmount)) &&
          validationErrors.length === 0 && (
            <View className="bg-green-50 rounded-xl border border-green-200 p-4 mb-4">
              <Text className="text-xl font-semibold text-green-800 mb-3">
                Investment Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-green-700">Investment Amount</Text>
                  <Text className="font-bold text-green-800">
                    {formatCurrency(
                      parseFloat(investmentAmount),
                      wallet.currency
                    )}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-green-700">Est. Monthly Return</Text>
                  <Text className="font-bold text-green-800">
                    {formatCurrency(
                      (parseFloat(investmentAmount) *
                        (property.rentalYield || 0)) /
                        100 /
                        12,
                      wallet.currency
                    )}
                  </Text>
                </View>
              </View>
            </View>
          )}
      </ScrollView>

      {/* Investment Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleInvest}
          disabled={
            !investmentAmount ||
            isNaN(parseFloat(investmentAmount)) ||
            validationErrors.length > 0 ||
            isValidating ||
            isInvesting
          }
          className={`py-4 rounded-lg flex-row items-center justify-center ${
            !investmentAmount ||
            isNaN(parseFloat(investmentAmount)) ||
            validationErrors.length > 0 ||
            isValidating ||
            isInvesting
              ? "bg-gray-300"
              : "bg-black"
          }`}
        >
          {(isValidating || isInvesting) && (
            <ActivityIndicator size="small" color="white" className="mr-2" />
          )}
          <Feather
            name="trending-up"
            size={20}
            color={
              !investmentAmount ||
              isNaN(parseFloat(investmentAmount)) ||
              validationErrors.length > 0 ||
              isValidating ||
              isInvesting
                ? "#9ca3af"
                : "white"
            }
          />
          <Text
            className={`ml-2 font-semibold text-lg ${
              !investmentAmount ||
              isNaN(parseFloat(investmentAmount)) ||
              validationErrors.length > 0 ||
              isValidating ||
              isInvesting
                ? "text-gray-500"
                : "text-white"
            }`}
          >
            {isValidating
              ? "Validating..."
              : isInvesting
              ? "Processing..."
              : "Invest Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InvestmentScreen;
