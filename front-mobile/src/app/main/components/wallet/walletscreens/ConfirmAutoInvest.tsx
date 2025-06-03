/* --------------------------------------------------------------------------
   🔹  ConfirmAutoInvest — step-4 review & launch screen
   -------------------------------------------------------------------------- */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { WebView } from "react-native-webview";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import { ThemeKey } from "../compoenets/ui/ThemeCard";
import { fetchAccountData, AccountData } from "@main/services/account";
import { fetchWalletBalance, WalletBalance } from "@main/services/wallet";
import {
  createPaymeDeposit,
  type CreatePaymeDepositRequest,
  type PaymeDepositResponse,
} from "@main/services/payment.service";

export type DepositData = {
  startDate: string;
  depositDay: number; // e.g. 15 (the day of the month)
  frequency: string;
  paymentMethod: string;
  paymentMethodId: string; // Add this to track the payment method ID
  verification: "Verified" | "Pending";
};

interface Props {
  amount: number;
  theme: ThemeKey;
  deposit: DepositData;
  onBack: () => void;
  onLaunch: () => void;
}

// Helper function to generate a mock wallet address for PayMe integration
const generateMockWalletAddress = (
  userId: string | number,
  email: string
): string => {
  // Create a deterministic wallet address based on user ID and email
  // This is for tracking purposes in PayMe integration only
  const hash = `${userId}-${email}`.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Generate a mock Ethereum-style address
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hexHash}${"0".repeat(32)}`;
};

const ConfirmAutoInvest: React.FC<Props> = ({
  amount,
  theme,
  deposit,
  onBack,
  onLaunch,
}) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  // PayMe WebView states
  const [paymeWebViewVisible, setPaymeWebViewVisible] = useState(false);
  const [paymeDepositData, setPaymeDepositData] =
    useState<PaymeDepositResponse | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // BottomSheet states
  const [noticeSheetVisible, setNoticeSheetVisible] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [autoInvestSuccessSheetVisible, setAutoInvestSuccessSheetVisible] =
    useState(false);
  const [autoInvestCancelSheetVisible, setAutoInvestCancelSheetVisible] =
    useState(false);
  const [paymeErrorSheetVisible, setPaymeErrorSheetVisible] = useState(false);
  const [paymeErrorMessage, setPaymeErrorMessage] = useState("");

  // Add debugging
  console.log("ConfirmAutoInvest rendered with amount:", amount);
  console.log("ConfirmAutoInvest props:", { amount, theme, deposit });

  // Validate that amount is properly passed
  if (amount === undefined || amount === null) {
    console.error("ConfirmAutoInvest: amount prop is undefined/null!");
  }

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [account, wallet] = await Promise.all([
          fetchAccountData(),
          fetchWalletBalance(),
        ]);
        setAccountData(account);
        setWalletData(wallet);
      } catch (error) {
        setNoticeMessage(
          "Unable to load account details. You can still proceed with creating your AutoInvest plan."
        );
        setNoticeSheetVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const formatThemeName = (themeKey: ThemeKey): string => {
    switch (themeKey) {
      case "growth":
        return "Growth";
      case "income":
        return "Income";
      case "diversified":
        return "Diversified";
      default:
        return "Balanced";
    }
  };

  const currency = walletData?.currency || "TND";
  const isAccountVerified = accountData?.isVerified ?? false;
  const actualVerificationStatus = isAccountVerified ? "Verified" : "Pending";
  const availableBalance = walletData?.cashBalance ?? 0;

  // Check if PayMe is selected as payment method
  const isPaymeSelected = deposit.paymentMethodId === "payme";

  // Handle launching AutoInvest
  const handleLaunchAutoInvest = async () => {
    if (!isAccountVerified) {
      return;
    }

    if (isPaymeSelected) {
      // Handle PayMe payment flow
      await handlePaymePayment();
    } else {
      // Handle other payment methods (Stripe, etc.)
      onLaunch();
    }
  };

  // Handle PayMe payment for AutoInvest
  const handlePaymePayment = async () => {
    try {
      setProcessingPayment(true);

      if (!accountData) {
        throw new Error("Account information not available");
      }

      // Generate a mock wallet address if none exists
      const walletAddress = generateMockWalletAddress(
        accountData.id || "user",
        accountData.email
      );

      // Create PayMe deposit request for AutoInvest
      const paymeRequest: CreatePaymeDepositRequest = {
        amount: amount,
        walletAddress,
        note: "AutoInvest monthly deposit via PayMe",
        first_name: accountData.name?.split(" ")[0] || "User",
        last_name: accountData.name?.split(" ").slice(1).join(" ") || "Account",
        email: accountData.email,
        phone: accountData.phone || "",
      };

      console.log("Creating PayMe AutoInvest deposit with data:", paymeRequest);

      const paymeResponse = await createPaymeDeposit(paymeRequest);
      setPaymeDepositData(paymeResponse);

      // Open PayMe WebView for payment
      setPaymeWebViewVisible(true);
    } catch (error) {
      console.error("PayMe AutoInvest payment error:", error);
      setProcessingPayment(false);
      setPaymeErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to initiate PayMe payment for AutoInvest"
      );
      setPaymeErrorSheetVisible(true);
    }
  };

  // Handle PayMe WebView navigation
  const handlePaymeWebViewNavigationStateChange = async (navState: any) => {
    console.log("PayMe AutoInvest WebView URL:", navState.url);

    // Check for completion indicators
    const completionIndicators = [
      "/loader",
      "/payment-success",
      "/wallet/deposit/success",
      "success",
      "completed",
    ];

    const isPaymentCompleted = completionIndicators.some((indicator) =>
      navState.url.toLowerCase().includes(indicator.toLowerCase())
    );

    // Check for cancellation indicators
    const cancellationIndicators = [
      "/payment-cancel",
      "/wallet/deposit/cancel",
      "cancel",
      "cancelled",
      "abort",
    ];

    const isPaymentCancelled = cancellationIndicators.some((indicator) =>
      navState.url.toLowerCase().includes(indicator.toLowerCase())
    );

    if (isPaymentCompleted) {
      console.log("PayMe AutoInvest payment completed");
      setPaymeWebViewVisible(false);
      setProcessingPayment(false);
      setAutoInvestSuccessSheetVisible(true);
    } else if (isPaymentCancelled) {
      console.log("PayMe AutoInvest payment was cancelled");
      setPaymeWebViewVisible(false);
      setProcessingPayment(false);
      setAutoInvestCancelSheetVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>
          Loading account details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Confirm & Launch
          </Text>
          <Text className="text-sm text-gray-500">
            Review your AutoInvest plan details before launching
          </Text>
        </View>

        {/* Summary Card */}
        <Card extraStyle="p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Feather name="check" size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Your AutoInvest Plan
            </Text>
          </View>

          {/* Amount */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="text-sm text-gray-500 mb-1">
              Monthly Investment
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {currency} {amount.toLocaleString()}
            </Text>
          </View>

          {[
            ["Investment Theme", formatThemeName(theme)],
            ["Start Date", deposit.startDate],
            ["Frequency", deposit.frequency],
            [
              "Payment Method",
              deposit.paymentMethod || "Default Payment Method",
            ],
          ].map(([label, value], idx) => (
            <View
              key={label}
              className={`flex-row justify-between py-2 ${
                idx < 3 ? "border-b border-gray-100" : ""
              }`}
            >
              <Text className="text-gray-500">{label}</Text>
              <Text className="font-semibold capitalize text-gray-900">
                {value}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between py-2">
            <Text className="text-gray-500">Account Status</Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  actualVerificationStatus === "Verified"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <Text
                className={`font-semibold ${
                  actualVerificationStatus === "Verified"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {actualVerificationStatus}
              </Text>
            </View>
          </View>
        </Card>

        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <View className="flex-row items-start">
            <Feather
              name="info"
              size={16}
              color="#6B7280"
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <Text className="text-sm text-gray-600 flex-1">
              By launching AutoInvest, you agree to our terms. Your first
              deposit will be processed on the selected date, and future
              deposits will occur monthly. Ensure you have sufficient funds in
              your account.
            </Text>
          </View>
        </View>

        {!isAccountVerified && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Feather
                name="alert-triangle"
                size={16}
                color="#F59E0B"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text className="text-sm text-yellow-800 flex-1">
                Your account verification is pending. AutoInvest will activate
                once your account is fully verified.
              </Text>
            </View>
          </View>
        )}

        {/* Payment Methods Notice */}
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <View className="flex-row items-start">
            <Feather
              name="credit-card"
              size={16}
              color="#10B981"
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <Text className="text-sm text-green-800 flex-1 font-medium">
              Multiple payment options available
            </Text>
          </View>
          <Text className="text-xs text-green-700 mt-1 ml-6">
            Your monthly investments can be paid with wallet funds, card, or
            PayMe account
          </Text>
        </View>

        <View className="mb-2">
          <TouchableOpacity
            onPress={handleLaunchAutoInvest}
            className="bg-black rounded-lg p-4 items-center mb-3 flex-row justify-center"
            disabled={!isAccountVerified || processingPayment}
            style={{
              opacity: isAccountVerified && !processingPayment ? 1 : 0.6,
            }}
          >
            {processingPayment ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Processing PayMe...
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-white font-semibold text-base mr-2">
                  {!isAccountVerified
                    ? "Pending Verification"
                    : isPaymeSelected
                    ? "Launch AutoInvest with PayMe"
                    : "Launch AutoInvest"}
                </Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            className="items-center py-3 border border-gray-200 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PayMe WebView Modal */}
      <Modal
        visible={paymeWebViewVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPaymeWebViewVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => {
                setPaymeWebViewVisible(false);
                setProcessingPayment(false);
              }}
              className="p-2"
            >
              <Feather name="x" size={24} color="#000000" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-black">
              PayMe AutoInvest
            </Text>
            <View className="w-8" />
          </View>

          {paymeDepositData && (
            <View className="p-4 bg-blue-50 border-b border-blue-200">
              <Text className="text-sm font-semibold text-black mb-2">
                AutoInvest Setup - Test Mode
              </Text>
              <Text className="text-xs text-black">
                Phone: {paymeDepositData.test_credentials.phone}
              </Text>
              <Text className="text-xs text-black">
                Password: {paymeDepositData.test_credentials.password}
              </Text>
              <Text className="text-xs text-black mt-2">
                Monthly Amount: {paymeDepositData.amount}{" "}
                {paymeDepositData.currency}
              </Text>
              <Text className="text-xs text-black">
                Theme: {formatThemeName(theme)}
              </Text>
            </View>
          )}

          {paymeDepositData?.payment_url && (
            <WebView
              source={{ uri: paymeDepositData.payment_url }}
              style={{ flex: 1 }}
              onNavigationStateChange={handlePaymeWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 justify-center items-center bg-white">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="text-black mt-4">Loading PayMe...</Text>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("PayMe AutoInvest WebView error: ", nativeEvent);
                setPaymeWebViewVisible(false);
                setProcessingPayment(false);
                setPaymeErrorMessage(
                  "Failed to load PayMe payment page. Please try again."
                );
                setPaymeErrorSheetVisible(true);
              }}
            />
          )}
        </View>
      </Modal>

      {/* Notice Bottom Sheet */}
      <BottomSheet
        visible={noticeSheetVisible}
        onClose={() => setNoticeSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Feather name="info" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-4">Notice</Text>
          <Text className="text-center text-black mb-6">{noticeMessage}</Text>
          <TouchableOpacity
            onPress={() => setNoticeSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* AutoInvest Success Bottom Sheet */}
      <BottomSheet
        visible={autoInvestSuccessSheetVisible}
        onClose={() => setAutoInvestSuccessSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check-circle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-4">
            AutoInvest Launched
          </Text>
          <Text className="text-center text-black mb-6">
            Your AutoInvest plan has been successfully launched with a{" "}
            {currency} {amount.toLocaleString()} monthly deposit via PayMe.
            {"\n\n"}Your first investment will be processed shortly!
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAutoInvestSuccessSheetVisible(false);
              onLaunch();
            }}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* AutoInvest Cancel Bottom Sheet */}
      <BottomSheet
        visible={autoInvestCancelSheetVisible}
        onClose={() => setAutoInvestCancelSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-4">
            <Feather name="x-circle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-4">
            Payment Cancelled
          </Text>
          <Text className="text-center text-black mb-6">
            Your AutoInvest setup was cancelled. No charges were made.
          </Text>
          <TouchableOpacity
            onPress={() => setAutoInvestCancelSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* PayMe Error Bottom Sheet */}
      <BottomSheet
        visible={paymeErrorSheetVisible}
        onClose={() => setPaymeErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-circle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-4">
            PayMe Error
          </Text>
          <Text className="text-center text-black mb-6">
            {paymeErrorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setPaymeErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ConfirmAutoInvest;
