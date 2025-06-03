import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@/app/main/components/profileScreens/components/ui/TopBar";
import {
  getUserInvestments,
  formatCurrency,
  Investment,
  UserInvestments,
} from "@/app/main/services/realEstateInvestment";

const InvestmentsPortfolio = () => {
  const [investmentsData, setInvestmentsData] =
    useState<UserInvestments | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    loadInvestments();
  }, [selectedStatus]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await getUserInvestments(1, 20, selectedStatus);
      setInvestmentsData(data);
    } catch (error) {
      console.error("Failed to load investments:", error);
      Alert.alert(
        "Error",
        "Failed to load your investments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvestments();
    setRefreshing(false);
  }, [selectedStatus]);

  const calculateTotalInvested = () =>
    investmentsData
      ? investmentsData.investments
          .filter((inv) => inv.status === "confirmed")
          .reduce((t, inv) => t + inv.amount, 0)
      : 0;

  const calculateEstimatedReturns = () =>
    investmentsData
      ? investmentsData.investments
          .filter((inv) => inv.status === "confirmed")
          .reduce((t, inv) => {
            const m = (inv.amount * inv.property.rental_yield) / 100 / 12;
            return t + m * 12;
          }, 0)
      : 0;

  const statusFilters = [
    { label: "All", value: undefined },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopBar title="My Investments" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-lg text-gray-600">
            Loading your investments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TopBar title="My Investments" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {investmentsData && investmentsData.investments.length > 0 && (
          <View className="bg-white mx-4 mt-4 rounded-xl border border-gray-200 p-4">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Portfolio Summary
            </Text>
            <View className="flex-row justify-between mb-4">
              <View className="flex-1">
                <Text className="text-gray-600">Total Invested</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotalInvested(), "TND")}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-600">Est. Annual Returns</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateEstimatedReturns(), "TND")}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-600">Active Investments</Text>
                <Text className="text-lg font-semibold">
                  {
                    investmentsData.investments.filter(
                      (inv) => inv.status === "confirmed"
                    ).length
                  }
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-600">Properties</Text>
                <Text className="text-lg font-semibold">
                  {
                    new Set(
                      investmentsData.investments.map((inv) => inv.property.id)
                    ).size
                  }
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mx-4 mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-4">
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.label}
                  onPress={() => setSelectedStatus(filter.value)}
                  className={`px-8 py-2 ml-2 rounded-full border ${
                    selectedStatus === filter.value
                      ? "bg-green-600 border-green-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedStatus === filter.value
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mx-4 mt-4 mb-6">
          {!investmentsData || investmentsData.investments.length === 0 ? (
            <View className="bg-white rounded-xl border border-gray-200 p-8 items-center">
              <Feather name="pie-chart" size={64} color="#9ca3af" />
              <Text className="mt-4 text-xl font-semibold text-gray-800">
                No Investments Yet
              </Text>
              <Text className="mt-2 text-gray-600 text-center">
                Start building your real estate portfolio by investing in
                properties.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/main/screens/(tabs)/properties")}
                className="mt-6 bg-black px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {investmentsData.investments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onPress={() =>
                    router.push(
                      `/main/components/portfolio/screens/investment-details?id=${investment.id}`
                    )
                  }
                />
              ))}
              {investmentsData.pagination.currentPage <
                investmentsData.pagination.totalPages && (
                <TouchableOpacity
                  onPress={() => console.log("Load more investments")}
                  className="bg-gray-100 py-4 rounded-lg flex-row items-center justify-center"
                >
                  <Feather name="chevron-down" size={20} color="#374151" />
                  <Text className="text-gray-700 font-semibold ml-2">
                    Load More
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InvestmentCard = ({
  investment,
  onPress,
}: {
  investment: Investment;
  onPress: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const estimatedMonthlyReturn =
    (investment.amount * investment.property.rental_yield) / 100 / 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-200 p-4"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
            {investment.property.name}
          </Text>
          <Text className="text-gray-600" numberOfLines={1}>
            {investment.property.location}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full ${getStatusColor(
            investment.status
          )}`}
        >
          <View className="flex-row items-center">
            <Feather
              name={getStatusIcon(investment.status)}
              size={12}
              color={investment.status === "confirmed" ? "#166534" : "#92400e"}
            />
            <Text className="ml-1 text-xs font-semibold capitalize">
              {investment.status}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-gray-600">Investment Amount</Text>
          <Text className="text-xl font-bold text-green-600">
            {formatCurrency(investment.amount, investment.currency)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-600">Est. Monthly Return</Text>
          <Text className="text-lg font-semibold text-green-600">
            {formatCurrency(estimatedMonthlyReturn, investment.currency)}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Feather name="home" size={16} color="#6b7280" />
          <Text className="ml-1 text-gray-600 capitalize">
            {investment.property.property_type}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Feather name="trending-up" size={16} color="#6b7280" />
          <Text className="ml-1 text-gray-600">
            {investment.property.expected_roi}% ROI
          </Text>
        </View>
        {investment.investmentDate && (
          <Text className="text-gray-500 text-sm">
            {new Date(investment.investmentDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default InvestmentsPortfolio;
