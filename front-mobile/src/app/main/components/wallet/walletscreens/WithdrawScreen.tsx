// screens/main/components/wallet/WithdrawScreen.tsx

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import AvailableToWithdraw from "../compoenets/ui/AvailableToWithdraw";
import AmountInputCard from "../compoenets/ui/AmountInputCard";
import {
  fetchWalletBalance,
  withdrawFunds,
  getCurrencySymbol,
  convertCurrency,
  type WalletBalance,
  type WithdrawRequest,
} from "../../../services/wallet";
import {
  fetchUserSettings,
  type UserSettings,
  fetchAccountData,
} from "../../../services/api";
import {
  getSavedPaymentMethods,
  formatCardDisplay,
  type SavedPaymentMethod,
  createPaymeWithdrawal,
  type CreatePaymeWithdrawalRequest,
  type PaymeWithdrawalResponse,
} from "@main/services/payment.service";

const MIN_WITHDRAW = 10.0;

// Card brand images
const cardBrandImages = {
  visa: require("@assets/visa.png"),
  mastercard: require("@assets/mastercard.png"),
  payme: require("@assets/payme.png"),
  stripe: require("@assets/stripe.png"),
};

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

const WithdrawScreen: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string>("");
  const [userAccount, setUserAccount] = useState<any>(null);

  // Bank account details for PayMe withdrawal
  const [bankAccount, setBankAccount] = useState({
    account_number: "",
    bank_name: "",
    account_holder: "",
  });
  const [showBankForm, setShowBankForm] = useState(false);

  // BottomSheet states
  const [confirmWithdrawSheetVisible, setConfirmWithdrawSheetVisible] =
    useState(false);
  const [withdrawErrorSheetVisible, setWithdrawErrorSheetVisible] =
    useState(false);
  const [paymeSuccessSheetVisible, setPaymeSuccessSheetVisible] =
    useState(false);
  const [paymeErrorSheetVisible, setPaymeErrorSheetVisible] = useState(false);
  const [withdrawSuccessSheetVisible, setWithdrawSuccessSheetVisible] =
    useState(false);
  const [withdrawFailedSheetVisible, setWithdrawFailedSheetVisible] =
    useState(false);
  const [bankFormErrorSheetVisible, setBankFormErrorSheetVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [withdrawData, setWithdrawData] = useState<WithdrawRequest | null>(
    null
  );

  // Helper functions
  const getPaymentMethodDisplayName = (method: SavedPaymentMethod): string => {
    if (method.type === "stripe" && method.card) {
      return formatCardDisplay(
        method.card.brand,
        method.card.last4,
        method.card.exp_month,
        method.card.exp_year
      );
    } else if (method.type === "payme" && method.payme) {
      return `PayMe ${method.payme.phone_number}`;
    }
    return "Payment Method";
  };

  // Helper function to get card brand image
  const getCardBrandImage = (method: SavedPaymentMethod) => {
    if (method.type === "stripe" && method.card) {
      const brand = method.card.brand.toLowerCase();
      if (brand === "visa") return cardBrandImages.visa;
      if (brand === "mastercard") return cardBrandImages.mastercard;
      return cardBrandImages.stripe;
    }
    return cardBrandImages.payme;
  };

  const getProcessingTime = (method: SavedPaymentMethod): string => {
    return method.type === "stripe" ? "1-3 business days" : "Instant";
  };

  const getWithdrawalFee = (method?: SavedPaymentMethod): number => {
    if (!method) return 0.0;
    return method.type === "stripe" ? 1.0 : 0.0; // $1 fee for card withdrawals
  };

  // Load wallet data and user settings on component mount
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get user account information
      const accountData = await fetchAccountData();
      setUserAccount(accountData);
      const userEmail = accountData.email;

      const [walletData, settings, paymentMethods] = await Promise.all([
        fetchWalletBalance(),
        fetchUserSettings(userEmail),
        getSavedPaymentMethods().catch(() => []),
      ]);

      setWalletData(walletData);
      setUserSettings(settings);
      setSavedPaymentMethods(paymentMethods);

      // Auto-select default payment method
      if (paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find(
          (method) => method.is_default
        );
        if (defaultMethod) {
          setSelectedMethod(defaultMethod.id);
        } else {
          setSelectedMethod(paymentMethods[0].id);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      console.error("Error loading wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData = savedPaymentMethods.find(
    (m) => m.id === selectedMethod
  );
  const numAmount = parseFloat(amount) || 0;
  const availableBalance = walletData?.cashBalance || 0;
  const withdrawalFee = getWithdrawalFee(selectedMethodData);
  const totalWithFee = numAmount + withdrawalFee;

  const valid =
    numAmount >= MIN_WITHDRAW &&
    totalWithFee <= availableBalance &&
    selectedMethod &&
    !withdrawing;

  const handleWithdraw = async () => {
    if (!valid || !walletData || !userAccount) return;

    try {
      setWithdrawing(true);

      if (selectedMethod === "payme") {
        await handlePaymeWithdrawal();
      } else {
        // Handle Stripe/other payment methods
        const selectedMethodData = savedPaymentMethods.find(
          (m) => m.id === selectedMethod
        );

        if (!selectedMethodData) {
          throw new Error("Please select a payment method");
        }

        const withdrawDataObj: WithdrawRequest = {
          amount: numAmount,
          description: `Withdrawal via ${getPaymentMethodDisplayName(
            selectedMethodData
          )}`,
          reference: `WD_${Date.now()}_${selectedMethodData.type.toUpperCase()}`,
        };

        // Show confirmation bottom sheet for other methods
        setWithdrawData(withdrawDataObj);
        setConfirmWithdrawSheetVisible(true);
      }
    } catch (err) {
      setWithdrawing(false);
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setWithdrawErrorSheetVisible(true);
    }
  };

  const handlePaymeWithdrawal = async () => {
    try {
      if (!userAccount) {
        throw new Error("User account information not available");
      }

      // Show bank account form if not filled
      if (
        selectedMethod === "payme" &&
        (!bankAccount.account_number || !bankAccount.bank_name)
      ) {
        setShowBankForm(true);
        setWithdrawing(false);
        return;
      }

      // Generate a mock wallet address if none exists
      // This is used for tracking purposes in PayMe integration
      const walletAddress =
        userAccount.walletAddress ||
        userAccount.address ||
        generateMockWalletAddress(userAccount.id, userAccount.email);

      // Create PayMe withdrawal request
      const paymeRequest: CreatePaymeWithdrawalRequest = {
        amount: numAmount,
        walletAddress,
        note: "Wallet withdrawal via PayMe",
        first_name: userAccount.firstName || userAccount.first_name || "User",
        last_name: userAccount.lastName || userAccount.last_name || "Account",
        email: userAccount.email,
        phone: userAccount.phone || userAccount.phoneNumber || "",
        bank_account: bankAccount,
      };

      console.log("Creating PayMe withdrawal with data:", paymeRequest);

      const paymeResponse = await createPaymeWithdrawal(paymeRequest);

      // Show success message
      setSuccessData(paymeResponse);
      setPaymeSuccessSheetVisible(true);
    } catch (error) {
      console.error("PayMe withdrawal error:", error);
      setWithdrawing(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to initiate PayMe withdrawal"
      );
      setPaymeErrorSheetVisible(true);
    }
  };

  const processRegularWithdrawal = async (withdrawDataObj: WithdrawRequest) => {
    try {
      await withdrawFunds(withdrawDataObj);
      setWithdrawSuccessSheetVisible(true);
    } catch (withdrawalError) {
      setErrorMessage(
        withdrawalError instanceof Error
          ? withdrawalError.message
          : "An error occurred during withdrawal"
      );
      setWithdrawFailedSheetVisible(true);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Withdraw" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-gray-600">Loading wallet data...</Text>
        </View>
      </View>
    );
  }

  if (error && !walletData) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Withdraw" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-medium text-gray-900 text-center">
            Unable to Load Wallet
          </Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadWalletData}
            className="mt-6 bg-green-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <TopBar title="Withdraw" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        >
          {/* ── Available Balance ──────────────────────────────── */}
          <AvailableToWithdraw
            balance={availableBalance}
            currencySymbol={getCurrencySymbol(walletData?.currency || "TND")}
          />

          {/* ── Amount Input ──────────────────────────────────── */}
          <AmountInputCard
            amount={amount}
            onChangeAmount={setAmount}
            onMaxPress={() =>
              setAmount((availableBalance - withdrawalFee).toString())
            }
            minAmount={MIN_WITHDRAW}
          />

          {/* ── Method Selection ──────────────────────────────── */}
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Withdrawal Method
            </Text>

            {/* Info about withdrawal methods */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <View className="flex-row items-start">
                <Feather
                  name="shield"
                  size={16}
                  color="#3B82F6"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <Text className="text-sm text-blue-800 flex-1">
                  For your security, you can only withdraw to payment methods
                  that you've previously used for deposits.
                </Text>
              </View>
            </View>

            {/* Paymee Option */}
            <Card
              extraStyle={`mb-4 p-4 rounded-2xl shadow-sm overflow-hidden ${
                selectedMethod === "payme"
                  ? "border-2 border-green-500"
                  : "border border-gray-200"
              }`}
            >
              <TouchableOpacity
                className="p-4 bg-white"
                onPress={() => {
                  setSelectedMethod("payme");
                  if (!bankAccount.account_number) {
                    setShowBankForm(true);
                  }
                }}
                disabled={withdrawing}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-10 rounded-lg bg-white shadow-sm items-center justify-center mr-4 border border-gray-100">
                    <Image
                      source={cardBrandImages.payme}
                      className="w-10 h-6"
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold text-gray-900">
                        PayMe.tn
                      </Text>
                      <View className="ml-2 px-2 py-1 bg-orange-100 rounded">
                        <Text className="text-xs text-orange-600 font-medium">
                          Bank Transfer
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600">
                      Withdraw to bank account via PayMe
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Processing: 1-3 minutes • Fee: 1.5% + 0.5 TND
                    </Text>
                    {bankAccount.account_number && (
                      <Text className="text-xs text-green-600 mt-1">
                        Bank: {bankAccount.bank_name} • Account: •••
                        {bankAccount.account_number.slice(-4)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Saved Payment Methods */}
            {savedPaymentMethods.map((method) => (
              <Card
                key={method.id}
                extraStyle={`mb-3 rounded-2xl shadow-sm overflow-hidden border ${
                  selectedMethod === method.id
                    ? "border-green-500 border-2"
                    : "border-gray-200"
                }`}
              >
                <TouchableOpacity
                  className="p-4 bg-white"
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={withdrawing}
                >
                  <View className="flex-row items-center">
                    <View className="w-16 h-10 rounded-lg bg-white shadow-sm items-center justify-center mr-4 border border-gray-100">
                      <Image
                        source={getCardBrandImage(method)}
                        className="w-10 h-6"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-gray-900">
                          {getPaymentMethodDisplayName(method)}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600">
                        {method.type === "stripe"
                          ? "Credit/Debit Card"
                          : "PayMe Account"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}

            {/* Notice about withdrawal methods */}
            {savedPaymentMethods.length === 0 && (
              <Card extraStyle="mb-4 p-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
                    <Feather name="info" size={24} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-700">
                      No Payment Methods Available
                    </Text>
                    <Text className="text-sm text-gray-500">
                      To withdraw funds, you must first deposit using a payment
                      method. This ensures withdrawals go back to the same
                      source for security.
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          </View>

          {/* ── Processing Time & Fees ────────────────────────── */}
          {selectedMethodData && (
            <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Estimated time</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {getProcessingTime(selectedMethodData)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Processing fee</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                  {withdrawalFee.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-100">
                <Text className="text-sm font-medium text-gray-900">
                  Total to withdraw
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                  {totalWithFee.toFixed(2)}
                </Text>
              </View>
            </Card>
          )}

          {/* ── Validation Messages ─────────────────────────────── */}
          {numAmount > 0 && numAmount < MIN_WITHDRAW && (
            <View className="mx-4 mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <Text className="text-sm text-yellow-800">
                Minimum withdrawal amount is{" "}
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {MIN_WITHDRAW.toFixed(2)}
              </Text>
            </View>
          )}

          {totalWithFee > availableBalance && numAmount >= MIN_WITHDRAW && (
            <View className="mx-4 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
              <Text className="text-sm text-red-800">
                Insufficient funds. Available:{" "}
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {availableBalance.toFixed(2)}
              </Text>
            </View>
          )}

          {/* ── Security Reminder ─────────────────────────────── */}
          <View className="px-6 mb-4 flex-row items-center">
            <Feather name="shield" size={20} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Secure withdrawal - Only withdraw to accounts in your name.
            </Text>
          </View>

          {/* ── Confirm Button ────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={!valid}
            className={`mx-4 rounded-2xl py-4 items-center ${
              valid ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            {withdrawing ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Processing...
                </Text>
              </View>
            ) : (
              <Text
                className={`text-base font-semibold ${
                  valid ? "text-white" : "text-gray-600"
                }`}
              >
                Confirm Withdrawal
              </Text>
            )}
          </TouchableOpacity>

          {/* ── View History Link ────────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.replace("transactions?filter=withdrawals")}
            className="mt-6 mb-8 flex-row items-center justify-center"
          >
            <Feather name="clock" size={16} color="#374151" />
            <Text className="ml-2 text-sm font-medium text-gray-900">
              View withdrawal history
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Account Form Modal */}
      <Modal
        visible={showBankForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBankForm(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setShowBankForm(false)}
              className="p-2"
            >
              <Feather name="x" size={24} color="#000000" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-black">
              Bank Account Details
            </Text>
            <View className="w-8" />
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-sm text-black mb-6">
              Please provide your bank account details for PayMe withdrawal.
            </Text>

            <View className="mb-4">
              <Text className="text-base font-medium text-black mb-2">
                Account Holder Name
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-black"
                  onChangeText={(text: string) =>
                    setBankAccount((prev) => ({
                      ...prev,
                      account_holder: text,
                    }))
                  }
                  value={bankAccount.account_holder}
                  placeholder="Enter account holder name"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-base font-medium text-black mb-2">
                Bank Name
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-black"
                  onChangeText={(text: string) =>
                    setBankAccount((prev) => ({ ...prev, bank_name: text }))
                  }
                  value={bankAccount.bank_name}
                  placeholder="Enter bank name"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-black mb-2">
                Account Number
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-black"
                  onChangeText={(text: string) =>
                    setBankAccount((prev) => ({
                      ...prev,
                      account_number: text,
                    }))
                  }
                  value={bankAccount.account_number}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (
                  bankAccount.account_holder &&
                  bankAccount.bank_name &&
                  bankAccount.account_number
                ) {
                  setShowBankForm(false);
                  setSelectedMethod("payme");
                } else {
                  setBankFormErrorSheetVisible(true);
                }
              }}
              className="bg-black rounded-lg py-4 items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                Save Bank Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowBankForm(false)}
              className="py-4 items-center"
            >
              <Text className="text-black font-medium">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Confirm Withdrawal Bottom Sheet */}
      <BottomSheet
        visible={confirmWithdrawSheetVisible}
        onClose={() => {
          setConfirmWithdrawSheetVisible(false);
          setWithdrawing(false);
        }}
      >
        <View className="pb-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Feather name="arrow-up" size={28} color="#000000" />
            </View>
            <Text className="text-xl font-semibold text-black mb-2">
              Confirm Withdrawal
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Please review your withdrawal details carefully
            </Text>
          </View>

          {/* Withdrawal Details Card */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-black font-medium">Amount</Text>
              <Text className="text-lg font-bold text-black">
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {numAmount.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-black font-medium">
                Destination
              </Text>
              <Text className="text-sm text-black text-right flex-1 ml-4">
                {savedPaymentMethods.find((m) => m.id === selectedMethod) &&
                  getPaymentMethodDisplayName(
                    savedPaymentMethods.find((m) => m.id === selectedMethod)!
                  )}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-black font-medium">
                Processing Time
              </Text>
              <Text className="text-sm text-black">
                {savedPaymentMethods.find((m) => m.id === selectedMethod) &&
                  getProcessingTime(
                    savedPaymentMethods.find((m) => m.id === selectedMethod)!
                  )}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <Text className="text-sm text-black font-medium">
                Processing Fee
              </Text>
              <Text className="text-sm text-black">
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {withdrawalFee.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-black">
                Total Amount
              </Text>
              <Text className="text-base font-bold text-black">
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {totalWithFee.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setConfirmWithdrawSheetVisible(false);
              if (withdrawData) {
                processRegularWithdrawal(withdrawData);
              }
            }}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Confirm Withdrawal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setConfirmWithdrawSheetVisible(false);
              setWithdrawing(false);
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Withdraw Error Bottom Sheet */}
      <BottomSheet
        visible={withdrawErrorSheetVisible}
        onClose={() => setWithdrawErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-circle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-2">
            Withdrawal Failed
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            We encountered an issue processing your withdrawal
          </Text>
          <View className="bg-red-50 rounded-lg p-4 mb-6 w-full">
            <Text className="text-sm text-black text-center">
              {errorMessage}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setWithdrawErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* PayMe Success Bottom Sheet */}
      <BottomSheet
        visible={paymeSuccessSheetVisible}
        onClose={() => setPaymeSuccessSheetVisible(false)}
      >
        <View className="pb-6">
          <View className="items-center mb-6">
            <Text className="text-xl font-semibold text-black mb-2">
              Withdrawal Request Submitted
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Your withdrawal has been successfully initiated
            </Text>
          </View>

          {successData && (
            <View className="bg-green-50 rounded-lg p-4 mb-6">
              <Text className="text-sm font-medium text-black mb-3">
                Transaction Details
              </Text>

              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-black">Withdrawal ID</Text>
                  <Text className="text-xs font-mono text-black">
                    {successData.withdrawal_id}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-black">Amount</Text>
                  <Text className="text-xs font-semibold text-black">
                    {successData.amount.toFixed(2)} {successData.currency}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-black">Processing Time</Text>
                  <Text className="text-xs text-black">
                    {successData.processing_time}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-xs text-black">Fees</Text>
                  <Text className="text-xs text-black">
                    {successData.fees.toFixed(2)} {successData.currency}
                  </Text>
                </View>

                <View className="flex-row justify-between pt-2 border-t border-green-200">
                  <Text className="text-sm font-semibold text-black">
                    Net Amount
                  </Text>
                  <Text className="text-sm font-bold text-black">
                    {successData.net_amount.toFixed(2)} {successData.currency}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod("");
              setPaymeSuccessSheetVisible(false);
              router.replace("transactions?filter=withdrawals");
            }}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">View Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod("");
              setPaymeSuccessSheetVisible(false);
              router.back();
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Withdraw Success Bottom Sheet */}
      <BottomSheet
        visible={withdrawSuccessSheetVisible}
        onClose={() => setWithdrawSuccessSheetVisible(false)}
      >
        <View className="pb-6">
          <View className="items-center mb-6">
            <Text className="text-xl font-semibold text-black mb-2">
              Withdrawal Successful
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Your funds have been processed successfully
            </Text>
          </View>

          <View className="bg-green-50 rounded-lg p-4 mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-black font-medium">
                Amount Withdrawn
              </Text>
              <Text className="text-lg font-bold text-black">
                {numAmount.toFixed(2)}{" "}
                {userSettings?.currency || walletData?.currency}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 mt-2 text-center">
              Funds will appear in your account based on the processing time for
              your selected payment method
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              setWithdrawSuccessSheetVisible(false);
              router.replace("transactions?filter=withdrawals");
            }}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">View Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              setWithdrawSuccessSheetVisible(false);
              router.back();
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold">Done</Text>
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
          <Text className="text-xl font-semibold text-black mb-2">
            PayMe Error
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            There was an issue with your PayMe withdrawal
          </Text>
          <View className="bg-red-50 rounded-lg p-4 mb-6 w-full">
            <Text className="text-sm text-black text-center">
              {errorMessage}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setPaymeErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Withdraw Failed Bottom Sheet */}
      <BottomSheet
        visible={withdrawFailedSheetVisible}
        onClose={() => setWithdrawFailedSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="x-circle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-2">
            Withdrawal Failed
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            Your withdrawal could not be processed at this time
          </Text>
          <View className="bg-red-50 rounded-lg p-4 mb-6 w-full">
            <Text className="text-sm text-black text-center">
              {errorMessage}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setWithdrawFailedSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Bank Form Error Bottom Sheet */}
      <BottomSheet
        visible={bankFormErrorSheetVisible}
        onClose={() => setBankFormErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-4">
            <Feather name="alert-triangle" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-2">
            Incomplete Information
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            All bank account details are required to proceed
          </Text>
          <View className="bg-yellow-50 rounded-lg p-4 mb-6 w-full">
            <Text className="text-sm text-black text-center">
              Please fill in all bank account details to continue with PayMe
              withdrawal
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setBankFormErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default WithdrawScreen;
