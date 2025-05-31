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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import AmountInputCard from "../compoenets/ui/AmountInputCard";
import {
  fetchWalletBalance,
  depositFunds,
  getCurrencySymbol,
  convertCurrency,
  type WalletBalance,
  type DepositRequest,
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
} from "@main/services/payment.service";

const MIN_DEPOSIT = 10.0;
const MAX_DEPOSIT = 10000.0;

const DepositScreen: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState<string>("");

  // Load wallet data and user settings on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      // Use the existing fetchAccountData function
      const accountData = await fetchAccountData();
      const userEmail = accountData.email;

      const [wallet, settings, paymentMethods] = await Promise.all([
        fetchWalletBalance(),
        fetchUserSettings(userEmail),
        getSavedPaymentMethods().catch(() => []),
      ]);

      setWalletData(wallet);
      setUserSettings(settings);
      setSavedPaymentMethods(paymentMethods);

      // Auto-select default payment method
      const defaultMethod = paymentMethods.find((method) => method.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
      } else if (paymentMethods.length > 0) {
        setSelectedMethod(paymentMethods[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData = savedPaymentMethods.find(
    (m) => m.id === selectedMethod
  );
  const numAmount = parseFloat(amount) || 0;
  const processingFee = 0.0; // No fee for deposits
  const totalWithFee = numAmount + processingFee;

  const valid =
    numAmount >= MIN_DEPOSIT &&
    numAmount <= MAX_DEPOSIT &&
    selectedMethod &&
    !depositing;

  const handleDeposit = async () => {
    if (!valid || !walletData || !selectedMethodData) return;

    try {
      setDepositing(true);

      // Prepare deposit data
      const depositData: DepositRequest = {
        amount: numAmount,
        description: `Deposit via ${getPaymentMethodDisplayName(
          selectedMethodData
        )}`,
        reference: `DEP_${Date.now()}_${selectedMethodData.type.toUpperCase()}`,
      };

      // Show confirmation dialog
      Alert.alert(
        "Confirm Deposit",
        `Add ${getCurrencySymbol(
          userSettings?.currency || walletData.currency
        )} ${numAmount.toFixed(
          2
        )} to your wallet using ${getPaymentMethodDisplayName(
          selectedMethodData
        )}?\n\nProcessing time: ${getProcessingTime(
          selectedMethodData
        )}\nFee: ${getCurrencySymbol(
          userSettings?.currency || walletData.currency
        )} ${processingFee.toFixed(2)}`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setDepositing(false),
          },
          {
            text: "Confirm",
            style: "default",
            onPress: () => processDeposit(depositData),
          },
        ]
      );
    } catch (err) {
      setDepositing(false);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const processDeposit = async (depositData: DepositRequest) => {
    try {
      await depositFunds(depositData);

      Alert.alert(
        "Deposit Successful",
        `Your deposit of ${numAmount.toFixed(2)} ${
          userSettings?.currency || walletData?.currency
        } has been processed successfully and added to your wallet.`,
        [
          {
            text: "View Transactions",
            onPress: () => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              router.push("transactions?filter=deposits");
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
    } catch (depositError) {
      Alert.alert(
        "Deposit Failed",
        depositError instanceof Error
          ? depositError.message
          : "An error occurred during deposit"
      );
    } finally {
      setDepositing(false);
    }
  };

  const formatDisplayAmount = (
    amount: number,
    currency: "USD" | "EUR" | "TND"
  ) => {
    if (!userSettings)
      return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;

    const convertedAmount = convertCurrency(
      amount,
      currency,
      userSettings.currency
    );
    return `${getCurrencySymbol(
      userSettings.currency
    )} ${convertedAmount.toFixed(2)}`;
  };

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
    return method.type === "stripe" ? "Instant" : "1-3 business days";
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Add Funds" onBackPress={() => router.back()} />
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
        <TopBar title="Add Funds" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-medium text-gray-900 text-center">
            Unable to Load Wallet
          </Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadInitialData}
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
      <TopBar title="Add Funds" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        >
          {/* ── Current Balance ──────────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Current Balance
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {formatDisplayAmount(
                walletData?.cashBalance || 0,
                walletData?.currency || "TND"
              )}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Cash available for investment and withdrawal
            </Text>
          </Card>

          {/* ── Amount Input ──────────────────────────────────── */}
          <AmountInputCard
            amount={amount}
            onChangeAmount={setAmount}
            onMaxPress={() => setAmount(MAX_DEPOSIT.toString())}
            minAmount={MIN_DEPOSIT}
            currencySymbol={getCurrencySymbol(
              userSettings?.currency || walletData?.currency || "TND"
            )}
            feeRate={0.0} // No fee for deposits by default
          />

          {/* ── Payment Method Selection ──────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Payment Method
            </Text>

            {savedPaymentMethods.length > 0 ? (
              savedPaymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;

                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    android_ripple={{ color: "#d1fae5", borderless: false }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      isSelected
                        ? "border-2 border-green-600 bg-green-50"
                        : "border border-gray-200"
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        isSelected ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Feather
                        name={
                          method.type === "stripe"
                            ? "credit-card"
                            : "smartphone"
                        }
                        size={20}
                        color={isSelected ? "#10B981" : "#6B7280"}
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-medium text-gray-900">
                          {getPaymentMethodDisplayName(method)}
                        </Text>
                        {method.is_default && (
                          <View className="ml-2 px-2 py-1 bg-green-100 rounded">
                            <Text className="text-xs text-green-600 font-medium">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-gray-500">
                        {method.type === "stripe"
                          ? "Credit/Debit Card"
                          : "PayMe Account"}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        {getProcessingTime(method)} • No fees
                      </Text>
                    </View>

                    <Feather
                      name={isSelected ? "check-circle" : "circle"}
                      size={22}
                      color={isSelected ? "#10B981" : "#9CA3AF"}
                    />
                  </Pressable>
                );
              })
            ) : (
              <View className="text-center py-8">
                <Feather name="credit-card" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 mb-4">
                  No saved payment methods
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "/main/components/wallet/walletscreens/PaymentMethodScreen"
                    )
                  }
                  className="bg-green-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">
                    Add Payment Method
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {savedPaymentMethods.length > 0 && (
              <Pressable
                onPress={() =>
                  router.push(
                    "/main/components/wallet/walletscreens/PaymentMethodScreen"
                  )
                }
                android_ripple={{ color: "#e5e7eb", borderless: false }}
                className="flex-row items-center pt-3 mt-1 border-t border-gray-100"
              >
                <Feather name="plus-circle" size={20} color="#374151" />
                <Text className="ml-2 text-sm font-medium text-gray-700">
                  Add new payment method
                </Text>
              </Pressable>
            )}
          </Card>

          {/* ── Processing Info ────────────────────────────────── */}
          {selectedMethodData && (
            <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Processing time</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {getProcessingTime(selectedMethodData)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Processing fee</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatDisplayAmount(
                    processingFee,
                    walletData?.currency || "TND"
                  )}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-100">
                <Text className="text-sm font-medium text-gray-900">
                  Total to pay
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatDisplayAmount(
                    totalWithFee,
                    walletData?.currency || "TND"
                  )}
                </Text>
              </View>
            </Card>
          )}

          {/* ── Validation Messages ─────────────────────────────── */}
          {numAmount > 0 && numAmount < MIN_DEPOSIT && (
            <View className="mx-4 mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <Text className="text-sm text-yellow-800">
                Minimum deposit amount is{" "}
                {formatDisplayAmount(
                  MIN_DEPOSIT,
                  walletData?.currency || "TND"
                )}
              </Text>
            </View>
          )}

          {numAmount > MAX_DEPOSIT && (
            <View className="mx-4 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
              <Text className="text-sm text-red-800">
                Maximum deposit amount is{" "}
                {formatDisplayAmount(
                  MAX_DEPOSIT,
                  walletData?.currency || "TND"
                )}
              </Text>
            </View>
          )}

          {/* ── Security Info ─────────────────────────────────── */}
          <View className="px-6 mb-4 flex-row items-start">
            <Feather
              name="shield"
              size={20}
              color="#10B981"
              className="mt-0.5"
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-green-700 mb-1">
                Secure Deposits
              </Text>
              <Text className="text-sm text-gray-600">
                All deposits are secured with bank-level encryption. Funds are
                typically available instantly for card deposits.
              </Text>
            </View>
          </View>

          {/* ── Confirm Button ────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleDeposit}
            disabled={!valid}
            className={`mx-4 rounded-2xl py-4 items-center ${
              valid ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            {depositing ? (
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
                Add Funds
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Quick Links ────────────────────────────────── */}
          <View className="mt-6 mb-8 space-y-3">
            <TouchableOpacity
              onPress={() => router.push("transactions?filter=deposits")}
              className="flex-row items-center mb-4 justify-center"
            >
              <Feather name="clock" size={16} color="#374151" />
              <Text className="ml-2 text-sm font-medium text-gray-900">
                View deposit history
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/main/components/wallet/walletscreens/WithdrawScreen"
                )
              }
              className="flex-row items-center justify-center"
            >
              <Feather name="arrow-up-circle" size={16} color="#374151" />
              <Text className="ml-2 text-sm font-medium text-gray-900">
                Withdraw funds
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DepositScreen;
