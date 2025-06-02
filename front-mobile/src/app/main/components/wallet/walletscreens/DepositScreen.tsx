import React, { useState, useEffect, useCallback } from "react";
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
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useFocusEffect } from "expo-router";
import { WebView } from "react-native-webview";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
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
  createPaymeDeposit,
  type CreatePaymeDepositRequest,
  type PaymeDepositResponse,
} from "@main/services/payment.service";

const MIN_DEPOSIT = 10.0;
const MAX_DEPOSIT = 10000.0;

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

  // Paymee WebView states
  const [paymeWebViewVisible, setPaymeWebViewVisible] = useState(false);
  const [paymeDepositData, setPaymeDepositData] =
    useState<PaymeDepositResponse | null>(null);
  const [userAccount, setUserAccount] = useState<any>(null);

  // Bottom sheet states
  const [depositSuccessSheetVisible, setDepositSuccessSheetVisible] =
    useState(false);
  const [depositErrorSheetVisible, setDepositErrorSheetVisible] =
    useState(false);
  const [paymeSuccessSheetVisible, setPaymeSuccessSheetVisible] =
    useState(false);
  const [paymeErrorSheetVisible, setPaymeErrorSheetVisible] = useState(false);
  const [paymeCancelSheetVisible, setPaymeCancelSheetVisible] = useState(false);
  const [confirmDepositSheetVisible, setConfirmDepositSheetVisible] =
    useState(false);
  const [generalErrorSheetVisible, setGeneralErrorSheetVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);
  const [confirmDepositData, setConfirmDepositData] = useState<any>(null);

  // Load wallet data and user settings on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Refresh saved payment methods when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only refresh payment methods, not all data
      refreshPaymentMethods();
    }, [])
  );

  // Refresh user settings when screen comes into focus to pick up currency changes
  useFocusEffect(
    useCallback(() => {
      const refreshUserSettings = async () => {
        if (userAccount) {
          try {
            const settings = await fetchUserSettings(userAccount.email);
            setUserSettings(settings);
          } catch (err) {
            console.error(
              "❌ DepositScreen: Error refreshing user settings:",
              err
            );
          }
        }
      };
      refreshUserSettings();
    }, [userAccount])
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 DepositScreen: Loading initial data...");

      // Use the existing fetchAccountData function
      const accountData = await fetchAccountData();
      setUserAccount(accountData);
      const userEmail = accountData.email;

      console.log("📧 DepositScreen: User email:", userEmail);

      const [wallet, settings, paymentMethods] = await Promise.all([
        fetchWalletBalance(),
        fetchUserSettings(userEmail),
        getSavedPaymentMethods().catch((err) => {
          console.error(
            "❌ DepositScreen: Error fetching saved payment methods:",
            err
          );
          return [];
        }),
      ]);

      console.log(
        "💳 DepositScreen: Loaded payment methods:",
        paymentMethods.length
      );
      console.log("💳 DepositScreen: Payment methods:", paymentMethods);

      setWalletData(wallet);
      setUserSettings(settings);
      setSavedPaymentMethods(paymentMethods);

      // Auto-select default payment method
      const defaultMethod = paymentMethods.find((method) => method.is_default);
      if (defaultMethod) {
        console.log(
          "✅ DepositScreen: Auto-selected default method:",
          defaultMethod.id
        );
        setSelectedMethod(defaultMethod.id);
      } else if (paymentMethods.length > 0) {
        console.log(
          "✅ DepositScreen: Auto-selected first method:",
          paymentMethods[0].id
        );
        setSelectedMethod(paymentMethods[0].id);
      } else {
        console.log("⚠️ DepositScreen: No payment methods available");
      }
    } catch (err) {
      console.error("❌ DepositScreen: Error loading initial data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      setGeneralErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshPaymentMethods = async () => {
    try {
      console.log("🔄 DepositScreen: Refreshing saved payment methods...");

      const paymentMethods = await getSavedPaymentMethods();

      console.log(
        "💳 DepositScreen: Refreshed payment methods:",
        paymentMethods.length
      );
      console.log(
        "💳 DepositScreen: Refreshed methods details:",
        paymentMethods
      );

      setSavedPaymentMethods(paymentMethods);

      // Auto-select default payment method if none is selected
      if (!selectedMethod && paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find(
          (method) => method.is_default
        );
        if (defaultMethod) {
          console.log(
            "✅ DepositScreen: Auto-selected default method after refresh:",
            defaultMethod.id
          );
          setSelectedMethod(defaultMethod.id);
        } else {
          console.log(
            "✅ DepositScreen: Auto-selected first method after refresh:",
            paymentMethods[0].id
          );
          setSelectedMethod(paymentMethods[0].id);
        }
      }
    } catch (err) {
      console.error("❌ DepositScreen: Error refreshing payment methods:", err);
      // Don't show error for just payment methods refresh, keep using existing state
    }
  };

  const selectedMethodData: SavedPaymentMethod | undefined =
    selectedMethod === "payme"
      ? ({
          id: "payme",
          type: "payme",
          is_default: false,
          payme: {
            phone_number: "N/A",
          },
        } as SavedPaymentMethod)
      : savedPaymentMethods.find((m) => m.id === selectedMethod);
  const numAmount = parseFloat(amount) || 0;
  const processingFee =
    selectedMethod === "payme" ? 0.5 + numAmount * 0.015 : 0.0;
  const totalWithFee = numAmount + processingFee;

  const valid =
    numAmount >= MIN_DEPOSIT &&
    numAmount <= MAX_DEPOSIT &&
    selectedMethod &&
    !depositing;

  const handleDeposit = async () => {
    if (!valid || !walletData || !userAccount) return;

    try {
      setDepositing(true);

      if (selectedMethod === "payme") {
        await handlePaymeDeposit();
      } else {
        // Handle Stripe/other payment methods
        const selectedMethodData = savedPaymentMethods.find(
          (m) => m.id === selectedMethod
        );

        if (!selectedMethodData) {
          throw new Error("Please select a payment method");
        }

        const depositData: DepositRequest = {
          amount: numAmount,
          description: `Deposit via ${getPaymentMethodDisplayName(
            selectedMethodData
          )}`,
          reference: `DEP_${Date.now()}_${selectedMethodData.type.toUpperCase()}`,
        };

        // Show confirmation dialog for Stripe
        setConfirmDepositData({
          amount: numAmount,
          currency: userSettings?.currency || walletData.currency,
          methodName: getPaymentMethodDisplayName(selectedMethodData),
          processingTime: getProcessingTime(selectedMethodData),
          fee: processingFee,
          depositData,
        });
        setConfirmDepositSheetVisible(true);
      }
    } catch (err) {
      setDepositing(false);
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setGeneralErrorSheetVisible(true);
    }
  };

  const handlePaymeDeposit = async () => {
    try {
      if (!userAccount) {
        throw new Error("User account information not available");
      }

      // Generate a mock wallet address if none exists
      // This is used for tracking purposes in PayMe integration
      const walletAddress =
        userAccount.walletAddress ||
        userAccount.address ||
        generateMockWalletAddress(userAccount.id, userAccount.email);

      // Create PayMe deposit request
      const paymeRequest: CreatePaymeDepositRequest = {
        amount: numAmount,
        walletAddress,
        note: "Wallet deposit via PayMe",
        first_name: userAccount.firstName || userAccount.first_name || "User",
        last_name: userAccount.lastName || userAccount.last_name || "Account",
        email: userAccount.email,
        phone: userAccount.phone || userAccount.phoneNumber || "",
      };

      console.log("Creating PayMe deposit with data:", paymeRequest);

      const paymeResponse = await createPaymeDeposit(paymeRequest);
      setPaymeDepositData(paymeResponse);

      // Open PayMe WebView for payment
      setPaymeWebViewVisible(true);
    } catch (error) {
      console.error("PayMe deposit error:", error);
      setDepositing(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to initiate PayMe deposit"
      );
      setPaymeErrorSheetVisible(true);
    }
  };

  const processStripeDeposit = async (depositData: DepositRequest) => {
    try {
      await depositFunds(depositData);

      // Set success data and show bottom sheet
      setSuccessData({
        type: "stripe",
        amount: numAmount,
        currency: userSettings?.currency || walletData?.currency,
      });
      setDepositSuccessSheetVisible(true);
    } catch (depositError) {
      setErrorMessage(
        depositError instanceof Error
          ? depositError.message
          : "An error occurred during deposit"
      );
      setDepositErrorSheetVisible(true);
    } finally {
      setDepositing(false);
    }
  };

  // Handle PayMe WebView navigation
  const handlePaymeWebViewNavigationStateChange = async (navState: any) => {
    console.log("PayMe Webview url:", navState.url);

    // Check for multiple completion indicators
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
      console.log("PayMe deposit process completed, processing deposit...");
      setPaymeWebViewVisible(false);

      try {
        // Show loading state
        setDepositing(true);

        await processTestModeDeposit();

        // Refresh wallet balance
        const updatedWallet = await fetchWalletBalance();
        setWalletData(updatedWallet);

        // Set success data and show bottom sheet
        setSuccessData({
          type: "payme",
          amount: numAmount,
          currency: updatedWallet.currency,
          newBalance: updatedWallet.cashBalance,
        });
        setPaymeSuccessSheetVisible(true);
      } catch (error) {
        console.error("Error processing test deposit:", error);
        setDepositing(false);
        setErrorMessage(
          "There was an issue processing your deposit. Please contact support if this persists."
        );
        setPaymeErrorSheetVisible(true);
      }
    } else if (isPaymentCancelled) {
      console.log("PayMe deposit was cancelled");
      setPaymeWebViewVisible(false);
      setDepositing(false);
      setPaymeCancelSheetVisible(true);
    }
  };

  // Process test mode deposit (simulate webhook)
  const processTestModeDeposit = async () => {
    if (!paymeDepositData || !userAccount) {
      throw new Error("Missing deposit data");
    }

    try {
      console.log("Processing deposit locally...");

      const testDepositData: DepositRequest = {
        amount: numAmount,
        description: `PayMe deposit`,
        reference: `PAYME_${Date.now()}`,
      };

      console.log("deposit with data:", testDepositData);

      // Call the local deposit function
      await depositFunds(testDepositData);

      console.log("Deposit processed successfully");

      return {
        status: "success",
        amount: numAmount,
        currency: "TND",
        transaction_id: `payme_${Date.now()}`,
      };
    } catch (error) {
      console.error("Error processing test mode deposit:", error);
      throw error;
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
    return method.type === "stripe" ? "Instant" : "1-3 minutes";
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
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Payment Method
            </Text>

            {/* Info about payment methods */}
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <View className="flex-row items-start">
                <Feather
                  name="shield"
                  size={16}
                  color="#10B981"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <Text className="text-sm text-green-800 flex-1">
                  Payment methods you add here will be saved securely and can be
                  used for future deposits and withdrawals.
                </Text>
              </View>
            </View>

            {/* Paymee Option */}
            <Card
              extraStyle={`mb-4 p-0 bg-white rounded-2xl shadow-sm overflow-hidden ${
                selectedMethod === "payme"
                  ? "border-2 border-green-500"
                  : "border border-gray-200"
              }`}
            >
              <TouchableOpacity
                className="p-4 bg-white"
                onPress={() => setSelectedMethod("payme")}
                disabled={depositing}
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
                    </View>
                    <Text className="text-sm text-gray-600">
                      Tunisian mobile payment solution
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Processing: 1-3 minutes • Fee: 1.5% + 0.5 TND
                    </Text>
                  </View>
                  {selectedMethod === "payme" && (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>

            {/* Saved Payment Methods */}
            {savedPaymentMethods.map((method) => (
              <Card
                key={method.id}
                extraStyle={`mb-3 p-0 rounded-2xl shadow-sm overflow-hidden ${
                  selectedMethod === method.id
                    ? "border-2 border-green-500"
                    : "border border-gray-200"
                }`}
              >
                <TouchableOpacity
                  className="p-4 bg-white"
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={depositing}
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
                        {method.is_default && (
                          <View className="ml-2 px-2 py-1 bg-green-100 rounded">
                            <Text className="text-xs text-green-600 font-medium">
                              Default
                            </Text>
                          </View>
                        )}
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

            {/* Add New Payment Method */}
            <Card extraStyle="mb-4 p-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() =>
                  router.push(
                    "/main/components/wallet/walletscreens/PaymentMethodScreen"
                  )
                }
              >
                <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
                  <Feather name="plus" size={24} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-700">
                    Add New Payment Method
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Add a credit card or other payment method
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </Card>
          </View>

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
              onPress={() => setPaymeWebViewVisible(false)}
              className="p-2"
            >
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              PayMe Deposit
            </Text>
            <View className="w-8" />
          </View>

          {paymeDepositData && (
            <View className="p-4 bg-blue-50 border-b border-blue-200">
              <Text className="text-sm font-semibold text-blue-900 mb-2">
                Use Sandbox Credentials
              </Text>
              <Text className="text-xs text-blue-700">
                Phone: {paymeDepositData.test_credentials.phone}
              </Text>
              <Text className="text-xs text-blue-700">
                Password: {paymeDepositData.test_credentials.password}
              </Text>
              <Text className="text-xs text-blue-600 mt-2">
                Amount: {paymeDepositData.amount} {paymeDepositData.currency}
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
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text className="text-gray-600 mt-4">Loading PayMe...</Text>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error: ", nativeEvent);
                setPaymeWebViewVisible(false);
                setDepositing(false);
                setErrorMessage(
                  "Failed to load PayMe payment page. Please try again."
                );
                setPaymeErrorSheetVisible(true);
              }}
            />
          )}
        </View>
      </Modal>

      {/* Bottom Sheets */}

      {/* Stripe Deposit Success Bottom Sheet */}
      <BottomSheet
        visible={depositSuccessSheetVisible}
        onClose={() => setDepositSuccessSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Deposit Successful!
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Your deposit of {successData?.amount?.toFixed(2)}{" "}
            {successData?.currency} has been processed successfully and added to
            your wallet.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod(
                savedPaymentMethods.find((m) => m.is_default)?.id || ""
              );
              setDepositSuccessSheetVisible(false);
              router.replace("transactions?filter=deposits");
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
              setDepositSuccessSheetVisible(false);
              router.back();
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Deposit Error Bottom Sheet */}
      <BottomSheet
        visible={depositErrorSheetVisible}
        onClose={() => setDepositErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="x" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Deposit Failed
          </Text>
          <Text className="text-center text-gray-600 mb-6">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setDepositErrorSheetVisible(false)}
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
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Deposit Successful!
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            {getCurrencySymbol(successData?.currency || "TND")}{" "}
            {successData?.amount?.toFixed(2)} has been added to your wallet via
            PayMe.
            {successData?.newBalance && (
              <Text className="font-semibold">
                {"\n\nNew balance: "}
                {getCurrencySymbol(successData.currency)}{" "}
                {successData.newBalance.toFixed(2)}
              </Text>
            )}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAmount("");
              setSelectedMethod("");
              setDepositing(false);
              setPaymeSuccessSheetVisible(false);
              router.replace("transactions?filter=deposits");
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
              setDepositing(false);
              setPaymeSuccessSheetVisible(false);
              router.back();
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Continue</Text>
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
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Processing Error
          </Text>
          <Text className="text-center text-gray-600 mb-6">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setPaymeErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* PayMe Cancel Bottom Sheet */}
      <BottomSheet
        visible={paymeCancelSheetVisible}
        onClose={() => setPaymeCancelSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-4">
            <Feather name="x-circle" size={28} color="#F59E0B" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Payment Cancelled
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Your deposit was cancelled. No charges were made.
          </Text>
          <TouchableOpacity
            onPress={() => setPaymeCancelSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* General Error Bottom Sheet */}
      <BottomSheet
        visible={generalErrorSheetVisible}
        onClose={() => setGeneralErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Error
          </Text>
          <Text className="text-center text-gray-600 mb-6">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setGeneralErrorSheetVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Confirm Deposit Bottom Sheet */}
      <BottomSheet
        visible={confirmDepositSheetVisible}
        onClose={() => setConfirmDepositSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
            <Feather name="credit-card" size={28} color="#3B82F6" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Confirm Deposit
          </Text>
          {confirmDepositData && (
            <Text className="text-center text-gray-600 mb-6">
              Add {getCurrencySymbol(confirmDepositData.currency)}{" "}
              {confirmDepositData.amount?.toFixed(2)} to your wallet using{" "}
              {confirmDepositData.methodName}?{"\n\n"}Processing time:{" "}
              {confirmDepositData.processingTime}
              {"\n"}Fee: {getCurrencySymbol(confirmDepositData.currency)}{" "}
              {confirmDepositData.fee?.toFixed(2)}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              setConfirmDepositSheetVisible(false);
              if (confirmDepositData?.depositData) {
                processStripeDeposit(confirmDepositData.depositData);
              }
            }}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setConfirmDepositSheetVisible(false);
              setDepositing(false);
            }}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default DepositScreen;
