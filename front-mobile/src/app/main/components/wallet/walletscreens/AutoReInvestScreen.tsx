import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import SetupCard from "../compoenets/ui/SetupCard";
import SetupCardLocked from "../compoenets/ui/SetupCardLocked";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import HowItWorks from "../compoenets/ui/HowItWorks";
import { BottomSheet } from "@main/components/profileScreens/components/ui";
import { getAutoReinvest, AutoReinvestData } from "@main/services/autoReinvest";

const { width } = Dimensions.get("window");

// ───────────────────────────────────────── helpers ──────
const BenefitRow = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <View className="flex-row mb-6">
    <View className="w-10 h-10 rounded-lg bg-[#F9FAFB] items-center justify-center mr-3">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>
  </View>
);

// ───────────────────────────────────────── component ─────
const AutoReinvestScreen: React.FC = () => {
  const router = useRouter();
  const [autoReinvestData, setAutoReinvestData] =
    useState<AutoReinvestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [errorSheetTitle, setErrorSheetTitle] = useState("");
  const [errorSheetMessage, setErrorSheetMessage] = useState("");

  useEffect(() => {
    fetchAutoReinvestData();
  }, []);

  const fetchAutoReinvestData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[AutoReInvestScreen] Fetching auto-reinvest data...");

      const data = await getAutoReinvest();
      console.log("[AutoReInvestScreen] Successfully fetched data:", data);
      setAutoReinvestData(data);
    } catch (err) {
      console.error(
        "[AutoReInvestScreen] Error fetching auto-reinvest data:",
        err
      );
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load auto-reinvest data";
      setError(errorMessage);

      // Show more specific error messages based on error type
      let alertTitle = "Connection Error";
      let alertMessage =
        "Unable to load auto-reinvest data. Please check your connection and try again.";

      if (
        errorMessage.includes("Authentication failed") ||
        errorMessage.includes("No authentication token") ||
        errorMessage.includes("Invalid authentication token")
      ) {
        alertTitle = "Authentication Error";
        alertMessage =
          "Your session has expired or is invalid. Please log in again to continue.";
      } else if (errorMessage.includes("Cannot reach server")) {
        alertTitle = "Network Error";
        alertMessage =
          "Cannot reach the server. Please check your internet connection and try again.";
      } else if (errorMessage.includes("session may have expired")) {
        alertTitle = "Session Expired";
        alertMessage = "Your session has expired. Please log in again.";
      }

      setErrorSheetTitle(alertTitle);
      setErrorSheetMessage(alertMessage);
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setErrorSheetVisible(false);
    fetchAutoReinvestData();
  };

  const handleContinueOffline = () => {
    console.log("[AutoReInvestScreen] Using fallback data");
    // Set mock data for development
    setAutoReinvestData({
      isEligible: false,
      totalInvested: 1350,
      minimumRequired: 2000,
      rentalStats: {
        totalRentalIncome: 0,
        totalReinvested: 0,
        availableToReinvest: 0,
        payoutCount: 0,
      },
    });
    setError(null);
    setErrorSheetVisible(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Auto Reinvest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-600 mt-4">
            Loading auto-reinvest data...
          </Text>
        </View>
      </View>
    );
  }

  const totalInvested = autoReinvestData?.totalInvested || 0;
  const isEligible = autoReinvestData?.isEligible || false;
  const minimumRequired = autoReinvestData?.minimumRequired || 2000;

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Auto Reinvest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 16,
        }}
      >
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center">
              <Feather name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-800 font-medium ml-2">
                Connection Error
              </Text>
            </View>
            <Text className="text-red-600 text-sm mt-1">
              {error}. Using offline data.
            </Text>
          </View>
        )}

        {isEligible ? (
          <SetupCard
            type="reinvest"
            autoReinvestData={autoReinvestData}
            onRefresh={fetchAutoReinvestData}
          />
        ) : (
          <SetupCardLocked
            totalInvested={totalInvested}
            minimumRequired={minimumRequired}
            type="reinvest"
          />
        )}

        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Benefits
        </Text>

        <BenefitRow
          icon={<Feather name="repeat" size={20} color="#10B981" />}
          title="Grow your wealth automatically"
          subtitle="Reinvest your rental income seamlessly into new opportunities to keep your money working for you."
        />
        <BenefitRow
          icon={<Feather name="clock" size={20} color="#10B981" />}
          title="Save time and effort"
          subtitle="No need to manually reinvest every month — Auto Reinvest takes care of it automatically."
        />
        <BenefitRow
          icon={<Feather name="pie-chart" size={20} color="#10B981" />}
          title="Build consistent growth"
          subtitle="Ensure your rental returns are always reinvested toward your long-term financial strategy."
        />

        <HowItWorks type="reinvest" />
      </ScrollView>

      {/* Error Bottom Sheet */}
      <BottomSheet
        visible={errorSheetVisible}
        onClose={() => setErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            {errorSheetTitle}
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {errorSheetMessage}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-green-600 rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleContinueOffline}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Continue Offline</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default AutoReinvestScreen;
