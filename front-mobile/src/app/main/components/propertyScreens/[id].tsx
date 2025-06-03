import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import * as Progress from "react-native-progress";

import { Property } from "@shared/types/property";
import { getPropertyById } from "@/app/main/services/getPropertyById";
import {
  getPropertyForInvestment,
  formatCurrency,
  PropertyInvestmentDetails,
} from "@/app/main/services/realEstateInvestment";
import { getWalletBalance } from "@/app/main/services/wallet";

import TopBar from "@/app/main/components/profileScreens/components/ui/TopBar";
import { GrayContainer } from "@main/components/ui/index";
import { InvestmentCard } from "@main/components/complex/index";
import {
  Carousel,
  AboutProperty,
  Leasing,
  StepperWithButton,
  Calculator,
  TimelineComp,
  BuildingInfo,
} from "@main/components/complex/index";
import { Card } from "../profileScreens/components/ui";

const Bed = require("@assets/bed.png");
const Bath = require("@assets/bath.png");
const Area = require("@assets/land-layers.png");
const StatusIcon = require("@assets/clip.png");
const Dot = require("@assets/dot.png");

type PropertyPageRouteProp = RouteProp<
  { PropertyPage: { id: string } },
  "PropertyPage"
>;

const PropertyPage = () => {
  const { params } = useRoute<PropertyPageRouteProp>();
  const { id } = params;

  const [property, setProperty] = useState<Property | null>(null);
  const [investmentData, setInvestmentData] =
    useState<PropertyInvestmentDetails | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investmentLoading, setInvestmentLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Defer API call to next tick to allow skeleton to render first
    const timer = setTimeout(() => {
      loadPropertyData();
    }, 50);

    return () => clearTimeout(timer);
  }, [id]);

  const loadPropertyData = async () => {
    try {
      setDataError(null);

      console.log(`[PropertyPage] Loading property ${id}...`);

      // Load basic property data first (always available and fast)
      const propertyData = await getPropertyById(id);
      setProperty(propertyData);
      setLoading(false); // Show UI immediately after property loads

      console.log(`[PropertyPage] ✅ Property data loaded, showing UI`);

      // Load investment data asynchronously (don't block UI)
      loadInvestmentDataAsync();
    } catch (err: any) {
      console.error(`[PropertyPage] Failed to load property:`, err);
      setDataError(err.message || "Failed to load property data");
      setLoading(false);
    }
  };

  const loadInvestmentDataAsync = async () => {
    try {
      setInvestmentLoading(true);
      console.log(`[PropertyPage] Loading investment data...`);

      const investmentInfo = await getPropertyForInvestment(parseInt(id));
      setInvestmentData(investmentInfo);
      console.log(`[PropertyPage] ✅ Investment data loaded`);

      // Only load wallet data if user is authenticated (investment data loaded successfully)
      loadWalletDataAsync();
    } catch (error: any) {
      console.log(
        `[PropertyPage] Investment data not available:`,
        error.message
      );
      // Don't try to load wallet data if user is not authenticated
    } finally {
      setInvestmentLoading(false);
    }
  };

  const loadWalletDataAsync = async () => {
    try {
      setWalletLoading(true);
      console.log(`[PropertyPage] Loading wallet data...`);

      const wallet = await getWalletBalance();
      setWalletData(wallet);
      console.log(`[PropertyPage] ✅ Wallet data loaded`);
    } catch (walletError: any) {
      console.log(
        `[PropertyPage] Wallet data not available:`,
        walletError.message
      );
    } finally {
      setWalletLoading(false);
    }
  };

  const handleInvestNow = () => {
    if (!investmentData) {
      Alert.alert(
        "Authentication Required",
        "Please log in to invest in this property.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/auth/screens/Login") },
        ]
      );
      return;
    }

    router.push({
      pathname: "/main/components/propertyScreens/investment/[id]",
      params: { id },
    });
  };

  // Simple skeleton loader component
  const SimpleSkeletonLoader = () => (
    <SafeAreaView className="flex-1 bg-white">
      <TopBar title="Loading..." onBackPress={() => router.back()} />
      <ScrollView className="flex-1 p-4">
        {/* Image placeholder */}
        <View className="w-full h-64 bg-gray-200 rounded-xl mb-4 animate-pulse" />

        {/* Title and location */}
        <View className="mb-6">
          <View className="w-3/4 h-8 bg-gray-200 rounded mb-3 animate-pulse" />
          <View className="w-1/2 h-6 bg-gray-200 rounded mb-3 animate-pulse" />
          <View className="flex-row space-x-4">
            <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>

        {/* Investment overview card */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <View className="w-1/2 h-6 bg-gray-200 rounded mb-4 animate-pulse" />
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center">
              <View className="w-16 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
              <View className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
            </View>
            <View className="flex-1 items-center">
              <View className="w-16 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
              <View className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
            </View>
            <View className="flex-1 items-center">
              <View className="w-16 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
              <View className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded animate-pulse" />
        </View>

        {/* Description */}
        <View className="mb-6">
          <View className="w-1/3 h-6 bg-gray-200 rounded mb-3 animate-pulse" />
          <View className="w-full h-4 bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="w-full h-4 bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="w-full h-14 bg-gray-200 rounded-lg animate-pulse" />
      </View>
    </SafeAreaView>
  );

  // Show loading only for initial property data
  if (loading) return <SimpleSkeletonLoader />;

  if (dataError || !property) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TopBar title="Property Details" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center p-6">
          <Feather name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-800">
            {dataError ? "Error Loading Property" : "Property Not Found"}
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            {dataError || "The property you're looking for could not be found."}
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

  // Calculate investment metrics using real data
  const isAuthenticated = !!investmentData;
  const hasWalletData = !!walletData;

  // Use investment data if available (more accurate), otherwise property data
  const currentAmount =
    investmentData?.property.currentAmount ?? property.current_funded ?? 0;
  const goalAmount =
    investmentData?.property.goalAmount ?? property.total_needed ?? 0;
  const fundingPercentage =
    goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  const remainingAmount = Math.max(0, goalAmount - currentAmount);
  const expectedRoi =
    investmentData?.property.expectedRoi ?? property.annual_return_rate ?? 0;
  const minimumInvestment =
    investmentData?.property.minimumInvestment ??
    property.min_investment ??
    1000;

  // Determine if investment is available
  const isFullyFunded = fundingPercentage >= 100;
  const isPropertyAvailable =
    property.status === "Available" ||
    property.status?.toLowerCase() === "available";
  const isAvailableForInvestment =
    isAuthenticated && hasWalletData && isPropertyAvailable && !isFullyFunded;
  const userHasSufficientFunds = hasWalletData
    ? (walletData.cashBalance || 0) >= minimumInvestment
    : false;

  // Progress bar value
  const progressValue = Math.min(fundingPercentage / 100, 1);

  // Format percentages consistently
  const formatPercentage = (value: number): string => {
    return Number(value || 0).toFixed(1);
  };

  // Investment status text
  const getInvestmentStatusText = () => {
    if (investmentLoading) return "Loading...";
    if (!isAuthenticated) return "Login Required";
    if (walletLoading) return "Loading Wallet...";
    if (!hasWalletData) return "Wallet Not Available";
    if (isFullyFunded) return "Fully Funded";
    if (!isPropertyAvailable) return "Not Available";
    if (!userHasSufficientFunds) return "Insufficient Funds";
    return "Available for Investment";
  };

  const getInvestmentStatusColor = () => {
    if (investmentLoading || walletLoading) return "bg-gray-400";
    if (isAvailableForInvestment && userHasSufficientFunds) return "bg-black";
    if (isFullyFunded) return "bg-green-600";
    return "bg-gray-400";
  };

  // Loading component for sections
  const LoadingBar = () => (
    <View className="w-full h-4 bg-gray-200 rounded-lg overflow-hidden">
      <View className="h-full bg-gray-300 rounded-lg animate-pulse w-3/4" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopBar title={property.name} onBackPress={() => router.back()} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Property Images Carousel */}
        <Carousel
          images={property.images || []}
          currentIndex={currentIndex}
          onScrollEnd={setCurrentIndex}
        />

        <View className="px-4 mt-4">
          {/* Property Title & Basic Info */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              {property.name}
            </Text>
            <Text className="text-lg text-gray-600 mb-3">
              {property.location}
            </Text>

            <View className="flex-row flex-wrap items-center space-x-2">
              <View className="flex-row items-center mr-4 mb-2">
                <Image source={Bed} className="h-4 w-4 mr-1" />
                <Text className="text-sm font-medium text-gray-700">
                  {property.rooms ?? "—"} rooms
                </Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <Image source={Bath} className="h-4 w-4 mr-1" />
                <Text className="text-sm font-medium text-gray-700">
                  {property.bathrooms ?? "—"} baths
                </Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <Image source={Area} className="h-4 w-4 mr-1" />
                <Text className="text-sm font-medium text-gray-700">
                  {property.area ?? "—"} m²
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Image source={StatusIcon} className="h-4 w-4 mr-1" />
                <Text className="text-sm font-medium text-gray-700">
                  {property.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Investment Overview Card */}
          <Card extraStyle="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Investment Overview
            </Text>

            {/* Key Metrics Row */}
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">Expected ROI</Text>
                <Text className="text-lg font-bold text-black">
                  {formatPercentage(expectedRoi)}%
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">
                  Min Investment
                </Text>
                {investmentLoading ? (
                  <LoadingBar />
                ) : (
                  <Text className="text-lg font-bold text-gray-900">
                    {isAuthenticated && investmentData?.wallet?.currency
                      ? formatCurrency(
                          minimumInvestment,
                          investmentData.wallet.currency
                        )
                      : `${minimumInvestment.toLocaleString()} DT`}
                  </Text>
                )}
              </View>
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">Remaining</Text>
                {investmentLoading ? (
                  <LoadingBar />
                ) : (
                  <Text className="text-lg font-bold text-orange-600">
                    {isAuthenticated && investmentData?.wallet?.currency
                      ? formatCurrency(
                          remainingAmount,
                          investmentData.wallet.currency
                        )
                      : `${remainingAmount.toLocaleString()} DT`}
                  </Text>
                )}
              </View>
            </View>

            {/* Progress Section */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-700">
                  Funding Progress
                </Text>
                <Text className="text-sm font-bold text-gray-900">
                  {formatPercentage(fundingPercentage)}%
                </Text>
              </View>

              <Progress.Bar
                progress={progressValue}
                width={null}
                height={8}
                color="#22c55e"
                unfilledColor="#e5e7eb"
                borderRadius={4}
                className="mb-3"
              />

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Current Funded</Text>
                  {investmentLoading ? (
                    <LoadingBar />
                  ) : (
                    <Text className="text-sm font-semibold text-green-600">
                      {isAuthenticated && investmentData?.wallet?.currency
                        ? formatCurrency(
                            currentAmount,
                            investmentData.wallet.currency
                          )
                        : `${currentAmount.toLocaleString()} DT`}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-500">Goal Amount</Text>
                  {investmentLoading ? (
                    <LoadingBar />
                  ) : (
                    <Text className="text-sm font-semibold text-gray-900">
                      {isAuthenticated && investmentData?.wallet?.currency
                        ? formatCurrency(
                            goalAmount,
                            investmentData.wallet.currency
                          )
                        : `${goalAmount.toLocaleString()} DT`}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Wallet Balance (if authenticated) */}
            {isAuthenticated && (
              <View className="p-3 bg-green-50 rounded-lg">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-green-900">
                    Your Wallet Balance
                  </Text>
                  {walletLoading ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : hasWalletData ? (
                    <Text className="text-sm font-bold text-green-600">
                      {formatCurrency(
                        walletData.cashBalance || 0,
                        walletData.currency || "TND"
                      )}
                    </Text>
                  ) : (
                    <Text className="text-sm text-red-600">Failed to load</Text>
                  )}
                </View>
                {hasWalletData && !userHasSufficientFunds && (
                  <Text className="text-xs text-red-600 mt-1">
                    Minimum investment:{" "}
                    {formatCurrency(
                      minimumInvestment,
                      walletData.currency || "TND"
                    )}
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Property Description */}
          <AboutProperty description={property.description ?? ""} />

          {/* Investment Calculator */}
          {isAvailableForInvestment && !investmentLoading && !walletLoading && (
            <View className="mt-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Investment Calculator
              </Text>
              <Calculator
                min={minimumInvestment}
                max={Math.min(remainingAmount, walletData?.cashBalance || 0)}
              />
            </View>
          )}

          {/* Investment Details Card */}
          <Card extraStyle="mt-6">
            <InvestmentCard property={property} />
          </Card>

          {/* Leasing and Timeline */}
          <Card extraStyle="mt-4">
            <Leasing status={property.status} type={property.type} fee={0} />
            <TimelineComp currentStep={isFullyFunded ? 3 : 2} />
          </Card>

          {/* Building Information */}
          <BuildingInfo
            propertyAge={
              property.construction_year
                ? `${
                    new Date().getFullYear() - property.construction_year
                  } years`
                : "—"
            }
            developerName="Korpor Inc."
            developerSite="https://korpor.com"
            address="—"
            locationQuery={property.location}
            documents={[]}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Investment Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <TouchableOpacity
          onPress={handleInvestNow}
          disabled={
            (!isAvailableForInvestment || !userHasSufficientFunds) &&
            !investmentLoading &&
            !walletLoading
          }
          className={`${getInvestmentStatusColor()} py-4 rounded-lg flex-row items-center justify-center shadow-lg ${
            (!isAvailableForInvestment || !userHasSufficientFunds) &&
            !investmentLoading &&
            !walletLoading
              ? "opacity-60"
              : ""
          }`}
        >
          {investmentLoading || walletLoading ? (
            <ActivityIndicator size={20} color="white" />
          ) : (
            <Feather
              name={
                isFullyFunded
                  ? "check-circle"
                  : isAvailableForInvestment
                  ? "trending-up"
                  : "lock"
              }
              size={20}
              color="white"
            />
          )}
          <Text className="text-white font-bold text-lg ml-2">
            {getInvestmentStatusText()}
          </Text>
        </TouchableOpacity>

        {!isAuthenticated && !investmentLoading && (
          <Text className="text-center text-gray-500 text-sm mt-2">
            Login to view investment details and wallet balance
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PropertyPage;
