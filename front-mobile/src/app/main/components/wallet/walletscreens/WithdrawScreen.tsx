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
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
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

        const withdrawData: WithdrawRequest = {
          amount: numAmount,
          description: `Withdrawal via ${getPaymentMethodDisplayName(
            selectedMethodData
          )}`,
          reference: `WD_${Date.now()}_${selectedMethodData.type.toUpperCase()}`,
        };

        // Show confirmation dialog for other methods
        Alert.alert(
          "Confirm Withdrawal",
          `Withdraw ${getCurrencySymbol(
            userSettings?.currency || walletData.currency
          )} ${numAmount.toFixed(
            2
          )} from your wallet to ${getPaymentMethodDisplayName(
            selectedMethodData
          )}?\n\nProcessing time: ${getProcessingTime(
            selectedMethodData
          )}\nFee: ${getCurrencySymbol(
            userSettings?.currency || walletData.currency
          )} ${withdrawalFee.toFixed(2)}`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setWithdrawing(false),
            },
            {
              text: "Confirm",
              style: "default",
              onPress: () => processRegularWithdrawal(withdrawData),
            },
          ]
        );
      }
    } catch (err) {
      setWithdrawing(false);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
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
      Alert.alert(
        "Withdrawal Request Submitted",
        `Your withdrawal request of ${paymeResponse.amount.toFixed(2)} ${
          paymeResponse.currency
        } has been submitted successfully.\n\nWithdrawal ID: ${
          paymeResponse.withdrawal_id
        }\nProcessing Time: ${
          paymeResponse.processing_time
        }\nFees: ${paymeResponse.fees.toFixed(2)} ${
          paymeResponse.currency
        }\nNet Amount: ${paymeResponse.net_amount.toFixed(2)} ${
          paymeResponse.currency
        }`,
        [
          {
            text: "View Transactions",
            onPress: () => {
              setAmount("");
              setSelectedMethod("");
              router.push("transactions?filter=withdrawals");
            },
          },
          {
            text: "OK",
            style: "default",
            onPress: () => {
              setAmount("");
              setSelectedMethod("");
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("PayMe withdrawal error:", error);
      setWithdrawing(false);
      Alert.alert(
        "PayMe Error",
        error instanceof Error
          ? error.message
          : "Failed to initiate PayMe withdrawal"
      );
    }
  };

  const processRegularWithdrawal = async (withdrawData: WithdrawRequest) => {
    try {
      await withdrawFunds(withdrawData);

      Alert.alert(
        "Withdrawal Successful",
        `Your withdrawal of ${numAmount.toFixed(2)} ${
          userSettings?.currency || walletData?.currency
        } has been processed successfully.`,
        [
          {
            text: "View Transactions",
            onPress: () => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              router.push("transactions?filter=withdrawals");
            },
          },
          {
            text: "OK",
            style: "default",
            onPress: () => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              router.back();
            },
          },
        ]
      );
    } catch (withdrawalError) {
      Alert.alert(
        "Withdrawal Failed",
        withdrawalError instanceof Error
          ? withdrawalError.message
          : "An error occurred during withdrawal"
      );
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
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Withdrawal Method
            </Text>

            {/* Paymee Option */}
            <Card extraStyle="mb-4 p-4 bg-white rounded-2xl shadow-sm">
              <TouchableOpacity
                className={`flex-row items-center ${
                  selectedMethod === "payme" ? "opacity-100" : "opacity-70"
                }`}
                onPress={() => {
                  setSelectedMethod("payme");
                  if (!bankAccount.account_number) {
                    setShowBankForm(true);
                  }
                }}
                disabled={withdrawing}
              >
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                  <Feather name="smartphone" size={24} color="#10B981" />
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
                {selectedMethod === "payme" && (
                  <Feather name="check-circle" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            </Card>

            {/* Saved Payment Methods */}
            {savedPaymentMethods.map((method) => (
              <Card
                key={method.id}
                extraStyle={`mb-3 p-4 border-2 ${
                  selectedMethod === method.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                } rounded-2xl`}
              >
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={withdrawing}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <Feather
                      name={
                        method.type === "stripe" ? "credit-card" : "smartphone"
                      }
                      size={24}
                      color="#374151"
                    />
                  </View>
                  <View className="flex-1">
                    {method.type === "stripe" && method.card && (
                      <>
                        <View className="flex-row items-center">
                          <Text className="text-base font-semibold text-gray-900">
                            {formatCardDisplay(
                              method.card.brand,
                              method.card.last4,
                              method.card.exp_month,
                              method.card.exp_year
                            )}
                          </Text>
                          {method.is_default && (
                            <View className="ml-2 px-2 py-1 bg-green-100 rounded">
                              <Text className="text-xs text-green-600 font-medium">
                                Default
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-600">
                          Credit/Debit Card
                        </Text>
                      </>
                    )}
                  </View>
                  {selectedMethod === method.id && (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              </Card>
            ))}
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
            onPress={() => router.push("transactions?filter=withdrawals")}
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
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Bank Account Details
            </Text>
            <View className="w-8" />
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-sm text-gray-600 mb-6">
              Please provide your bank account details for PayMe withdrawal.
            </Text>

            <View className="mb-4">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Account Holder Name
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-gray-900"
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
              <Text className="text-base font-medium text-gray-900 mb-2">
                Bank Name
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-gray-900"
                  onChangeText={(text: string) =>
                    setBankAccount((prev) => ({ ...prev, bank_name: text }))
                  }
                  value={bankAccount.bank_name}
                  placeholder="Enter bank name"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Account Number
              </Text>
              <View className="border border-gray-300 rounded-lg p-3">
                <TextInput
                  className="text-base text-gray-900"
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
                  Alert.alert(
                    "Error",
                    "Please fill in all bank account details"
                  );
                }
              }}
              className="bg-green-600 rounded-lg py-4 items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                Save Bank Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowBankForm(false)}
              className="py-4 items-center"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default WithdrawScreen;
