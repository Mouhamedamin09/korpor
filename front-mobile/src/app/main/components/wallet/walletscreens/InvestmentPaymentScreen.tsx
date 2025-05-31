import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CardField,
  useStripe,
  StripeProvider,
  usePlatformPay,
  PlatformPayButton,
  PlatformPay,
  ApplePay,
} from "@stripe/stripe-react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import {
  getPaymentMethods,
  createStripePayment,
  getStripeTestCards,
  getSavedPaymentMethods,
  createPaymentWithSavedStripeMethod,
  formatCardDisplay,
  type PaymentMethods,
  type PaymentMethod,
  type SavedPaymentMethod,
} from "@main/services/payment.service";
import {
  createInvestment,
  formatInvestmentAmount,
  getPaymentMethodDisplayInfo,
  validateInvestmentRequest,
  type CreateInvestmentRequest,
  type InvestmentResponse,
} from "@main/services/investment.service";
import { fetchAccountData } from "@main/services/account";

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn";

interface InvestmentParams {
  projectId: string;
  projectName: string;
  amount: string;
  currency?: string;
}

const InvestmentPaymentContent: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { confirmPayment } = useStripe();
  const { isPlatformPaySupported, confirmPlatformPayPayment } =
    usePlatformPay();

  // Parse params safely
  const projectId = (params.projectId as string) || "";
  const projectName = (params.projectName as string) || "Unknown Project";
  const amount = parseFloat((params.amount as string) || "0");
  const currency = (params.currency as string) || "USD";

  // State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(
    null
  );
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  // Payment state
  const [cardComplete, setCardComplete] = useState(false);
  const [investmentResult, setInvestmentResult] =
    useState<InvestmentResponse | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [usePlatformPayment, setUsePlatformPayment] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Check for Google Pay and Apple Pay support
  useEffect(() => {
    checkPlatformPaySupport();
  }, [paymentMethods]);

  const checkPlatformPaySupport = async () => {
    try {
      if (Platform.OS === "android") {
        // Check Google Pay support
        const googlePaySupported = await isPlatformPaySupported({
          googlePay: {
            testEnv: paymentMethods?.stripe.test_mode || true,
          },
        });
        setIsGooglePaySupported(googlePaySupported);
      }
      // Note: Apple Pay support will be added in a future update
    } catch (error) {
      console.error("Error checking platform pay support:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      const [methods, savedMethods, account] = await Promise.all([
        getPaymentMethods(),
        getSavedPaymentMethods().catch(() => []),
        fetchAccountData().catch(() => null),
      ]);

      setPaymentMethods(methods);
      setSavedPaymentMethods(savedMethods);
      setUserAccount(account);

      // Auto-select first available payment method
      if (methods.stripe.enabled) {
        setSelectedPaymentMethod("stripe");
        // If there are saved methods, select the default one
        const defaultMethod = savedMethods.find((method) => method.is_default);
        if (defaultMethod) {
          setSelectedSavedMethod(defaultMethod.id);
        } else if (savedMethods.length > 0) {
          setSelectedSavedMethod(savedMethods[0].id);
        } else {
          setUseNewCard(true);
        }
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      Alert.alert("Error", "Failed to load payment methods. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInvestment = async () => {
    if (!selectedPaymentMethod || !userAccount) {
      Alert.alert(
        "Error",
        "Please select a payment method and ensure your account is loaded."
      );
      return;
    }

    // Check if using platform pay
    if (usePlatformPayment && (isGooglePaySupported || isApplePaySupported)) {
      await handlePlatformPayInvestment();
      return;
    }

    const investmentRequest: CreateInvestmentRequest = {
      projectId,
      amount,
      paymentMethod: selectedPaymentMethod,
      currency,
      userEmail: userAccount.email,
      walletAddress:
        userAccount.walletAddress ||
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      note: `Investment in ${projectName}`,
      savedPaymentMethodId: selectedSavedMethod || undefined,
    };

    // Validate request
    const validation = validateInvestmentRequest(investmentRequest);
    if (!validation.isValid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      if (selectedPaymentMethod === "stripe") {
        await handleStripePayment(investmentRequest);
      } else if (selectedPaymentMethod === "payme") {
        await handlePayMePayment(investmentRequest);
      }
    } catch (error) {
      console.error("Investment error:", error);
      Alert.alert(
        "Investment Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformPayInvestment = async () => {
    try {
      setLoading(true);

      // Create investment request
      const investmentRequest: CreateInvestmentRequest = {
        projectId,
        amount,
        paymentMethod: "stripe",
        currency,
        userEmail: userAccount.email,
        walletAddress:
          userAccount.walletAddress ||
          "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        note: `Investment in ${projectName}`,
      };

      // Create investment and get payment intent
      const result = await createInvestment(investmentRequest);

      if (result.status === "success" && result.payment_data.client_secret) {
        // Configure Google Pay options (Android only for now)
        if (Platform.OS === "android") {
          const { error } = await confirmPlatformPayPayment(
            result.payment_data.client_secret,
            {
              googlePay: {
                testEnv: paymentMethods?.stripe.test_mode || true,
                merchantName: "Korpor",
                merchantCountryCode: "US",
                currencyCode: currency.toUpperCase(),
              },
            }
          );

          if (error) {
            throw new Error(error.message);
          }

          // Success!
          setInvestmentResult(result);
          Alert.alert(
            "Investment Successful! 🎉",
            `Your ${formatInvestmentAmount(
              amount,
              currency
            )} investment in ${projectName} has been processed successfully via Google Pay.`,
            [
              {
                text: "View Investment",
                onPress: () => router.push("/main/screens/(tabs)/wallet"),
              },
            ]
          );
        } else {
          throw new Error("Apple Pay support coming soon");
        }
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Platform Pay investment error:", error);
      Alert.alert(
        "Investment Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (request: CreateInvestmentRequest) => {
    try {
      let result: InvestmentResponse;

      if (selectedSavedMethod && !useNewCard) {
        // Use saved payment method
        const paymentResponse = await createPaymentWithSavedStripeMethod(
          selectedSavedMethod,
          amount,
          currency
        );

        // Create investment record
        result = {
          status: "success",
          investment_id: `inv_${Date.now()}`,
          payment_id: paymentResponse.payment_intent_id,
          payment_method: "stripe",
          amount,
          currency,
          project_id: projectId,
          user_address: request.walletAddress,
          payment_data: {
            client_secret: paymentResponse.client_secret,
            customer_id: paymentResponse.customer_id,
            test_mode: paymentResponse.test_mode,
          },
        };
      } else {
        // Create new payment with card details
        result = await createInvestment(request);
      }

      if (result.status === "success" && result.payment_data.client_secret) {
        // Confirm payment with Stripe
        const { error } = await confirmPayment(
          result.payment_data.client_secret,
          {
            paymentMethodType: "Card",
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        // Success!
        setInvestmentResult(result);
        Alert.alert(
          "Investment Successful! 🎉",
          `Your ${formatInvestmentAmount(
            amount,
            currency
          )} investment in ${projectName} has been processed successfully.`,
          [
            {
              text: "View Investment",
              onPress: () => router.push("/main/screens/(tabs)/wallet"),
            },
          ]
        );
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePayMePayment = async (request: CreateInvestmentRequest) => {
    try {
      const result = await createInvestment(request);

      Alert.alert(
        "PayMe - Coming Soon! 🚧",
        result.payment_data.message +
          "\n\nFeatures planned:\n" +
          result.payment_data.features_planned
            ?.map((feature: string) => `• ${feature}`)
            .join("\n"),
        [{ text: "OK" }]
      );
    } catch (error) {
      throw error;
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <TopBar title="Investment Payment" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-600 mt-4">Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getPaymentMethodOptions = () => {
    if (!paymentMethods) return [];

    return [
      {
        id: "stripe" as PaymentMethod,
        ...paymentMethods.stripe,
        icon: "credit-card",
        color: "#635BFF",
      },
      {
        id: "payme" as PaymentMethod,
        ...paymentMethods.payme,
        icon: "smartphone",
        color: "#00D4AA",
      },
    ].filter((method) => method.enabled || method.id === "payme"); // Show PayMe for coming soon message
  };

  const isPaymentReady = () => {
    if (usePlatformPayment) {
      return isGooglePaySupported; // Only Google Pay for now
    }
    if (selectedPaymentMethod === "stripe") {
      return selectedSavedMethod || (useNewCard && cardComplete);
    }
    return selectedPaymentMethod === "payme";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <TopBar
        title="Investment Payment"
        onBackPress={() => router.back()}
        rightComponent={
          paymentMethods?.stripe.test_mode && (
            <View className="px-2 py-1 bg-blue-100 rounded">
              <Text className="text-xs text-blue-600 font-medium">
                Test Mode
              </Text>
            </View>
          )
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Investment Summary */}
        <View className="px-4 mt-4">
          <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                <Feather name="trending-up" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Investment Summary
                </Text>
                <Text className="text-sm text-gray-600">
                  Review your investment details
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-sm text-gray-500 mb-1">Project</Text>
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {projectName}
              </Text>

              <Text className="text-sm text-gray-500 mb-1">
                Investment Amount
              </Text>
              <Text className="text-2xl font-bold text-green-600">
                {formatInvestmentAmount(amount, currency)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Payment Method Selection */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Choose Payment Method
          </Text>

          {/* Platform Pay Option */}
          {isGooglePaySupported && (
            <Card
              extraStyle={`mb-3 p-4 border-2 ${
                usePlatformPayment
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              } rounded-2xl`}
            >
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => {
                  setUsePlatformPayment(true);
                  setSelectedPaymentMethod("stripe");
                  setUseNewCard(false);
                  setSelectedSavedMethod(null);
                }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: "#4285F4" + "20" }}
                >
                  <Feather name="credit-card" size={24} color="#4285F4" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-gray-900">
                      Google Pay
                    </Text>
                    {paymentMethods?.stripe.test_mode && (
                      <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                        <Text className="text-xs text-blue-600 font-medium">
                          Test Mode
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600">
                    Use cards saved in your Google wallet
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Processing: Instant
                  </Text>
                </View>

                <View className="items-center">
                  {usePlatformPayment && (
                    <Feather name="check-circle" size={20} color="#10B981" />
                  )}
                </View>
              </TouchableOpacity>
            </Card>
          )}

          {getPaymentMethodOptions().map((method) => (
            <Card
              key={method.id}
              extraStyle={`mb-3 p-4 border-2 ${
                selectedPaymentMethod === method.id && !usePlatformPayment
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              } rounded-2xl`}
            >
              <TouchableOpacity
                className={`flex-row items-center ${
                  !method.enabled && method.id !== "payme" ? "opacity-50" : ""
                }`}
                onPress={() => {
                  if (method.enabled || method.id === "payme") {
                    setSelectedPaymentMethod(method.id);
                    setUsePlatformPayment(false);
                    if (
                      method.id === "stripe" &&
                      savedPaymentMethods.length > 0
                    ) {
                      const defaultMethod = savedPaymentMethods.find(
                        (m) => m.is_default
                      );
                      if (defaultMethod) {
                        setSelectedSavedMethod(defaultMethod.id);
                        setUseNewCard(false);
                      }
                    }
                  }
                }}
                disabled={!method.enabled && method.id !== "payme"}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: method.color + "20" }}
                >
                  <Feather
                    name={method.icon as any}
                    size={24}
                    style={{ color: method.color }}
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-gray-900">
                      {method.name}
                    </Text>
                    {method.test_mode && (
                      <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                        <Text className="text-xs text-blue-600 font-medium">
                          Test Mode
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600">
                    {method.description}
                  </Text>
                  {method.processing_time && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Processing: {method.processing_time}
                    </Text>
                  )}
                </View>

                <View className="items-center">
                  {selectedPaymentMethod === method.id &&
                    !usePlatformPayment && (
                      <Feather name="check-circle" size={20} color="#10B981" />
                    )}
                  {!method.enabled && method.id !== "payme" && (
                    <Text className="text-xs text-gray-400">Disabled</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Platform Pay Button */}
        {usePlatformPayment && isGooglePaySupported && (
          <View className="px-4 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Google Pay Payment
            </Text>
            <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm">
              <View className="mb-4">
                <Text className="text-sm text-gray-600 text-center">
                  Complete your investment using Google Pay
                </Text>
              </View>

              <PlatformPayButton
                type={PlatformPay.ButtonType.Order}
                onPress={handleInvestment}
                style={{
                  width: "100%",
                  height: 50,
                }}
                disabled={loading}
              />
            </Card>
          </View>
        )}

        {/* Saved Payment Methods for Stripe */}
        {selectedPaymentMethod === "stripe" &&
          !usePlatformPayment &&
          savedPaymentMethods.length > 0 && (
            <View className="px-4 mt-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Saved Payment Methods
              </Text>

              {savedPaymentMethods.map((method) => (
                <Card
                  key={method.id}
                  extraStyle={`mb-3 p-4 border-2 ${
                    selectedSavedMethod === method.id && !useNewCard
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  } rounded-2xl`}
                >
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => {
                      setSelectedSavedMethod(method.id);
                      setUseNewCard(false);
                    }}
                  >
                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                      <Feather name="credit-card" size={24} color="#374151" />
                    </View>

                    <View className="flex-1">
                      {method.card && (
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

                    <View className="items-center">
                      {selectedSavedMethod === method.id && !useNewCard && (
                        <Feather
                          name="check-circle"
                          size={20}
                          color="#10B981"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}

              {/* Add New Card Option */}
              <Card
                extraStyle={`p-4 border-2 ${
                  useNewCard
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                } rounded-2xl`}
              >
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setUseNewCard(true);
                    setSelectedSavedMethod(null);
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <Feather name="plus" size={24} color="#374151" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Use New Card
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Enter new card details
                    </Text>
                  </View>

                  <View className="items-center">
                    {useNewCard && (
                      <Feather name="check-circle" size={20} color="#10B981" />
                    )}
                  </View>
                </TouchableOpacity>
              </Card>
            </View>
          )}

        {/* Stripe Card Input for New Card */}
        {selectedPaymentMethod === "stripe" &&
          !usePlatformPayment &&
          useNewCard && (
            <View className="px-4 mt-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </Text>
              <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm">
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    textColor: "#000000",
                  }}
                  style={{
                    width: "100%",
                    height: 50,
                    marginVertical: 10,
                  }}
                  onCardChange={(cardDetails) => {
                    setCardComplete(cardDetails.complete);
                  }}
                />

                {paymentMethods?.stripe.test_mode && (
                  <TouchableOpacity
                    className="mt-3 flex-row items-center"
                    onPress={async () => {
                      try {
                        const testCards = await getStripeTestCards();
                        const cardList = Object.entries(testCards.cards)
                          .filter(
                            ([key]) =>
                              !["declined", "insufficientFunds"].includes(key)
                          )
                          .map(([type, number]) => `${type}: ${number}`)
                          .join("\n");

                        Alert.alert(
                          "Test Card Numbers 💳",
                          `${testCards.message}\n\n${cardList}\n\n• Use any future expiry date\n• Use any 3-digit CVC`,
                          [{ text: "OK" }]
                        );
                      } catch (error) {
                        Alert.alert(
                          "Info",
                          "Test cards: 4242 4242 4242 4242\nUse any future date and CVC"
                        );
                      }
                    }}
                  >
                    <Feather name="info" size={16} color="#3B82F6" />
                    <Text className="ml-2 text-sm text-blue-600">
                      View test card numbers
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            </View>
          )}

        {/* Investment Button */}
        {!usePlatformPayment && (
          <View className="px-4 mt-8">
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                loading || !selectedPaymentMethod || !isPaymentReady()
                  ? "bg-gray-300"
                  : "bg-green-600"
              }`}
              onPress={handleInvestment}
              disabled={loading || !selectedPaymentMethod || !isPaymentReady()}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="ml-2 text-white font-semibold">
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Invest {formatInvestmentAmount(amount, currency)}
                </Text>
              )}
            </TouchableOpacity>

            {selectedPaymentMethod === "stripe" &&
              useNewCard &&
              !cardComplete && (
                <Text className="text-center text-sm text-gray-500 mt-2">
                  Please complete your card details
                </Text>
              )}
          </View>
        )}

        {/* Platform Pay Information */}
        {isGooglePaySupported && (
          <View className="px-4 mt-6">
            <Card extraStyle="p-4 bg-green-50 rounded-2xl border border-green-200">
              <View className="flex-row items-start">
                <Feather name="check-circle" size={20} color="#10B981" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-green-900">
                    Google Pay Available
                  </Text>
                  <Text className="text-sm text-green-700 mt-1">
                    Quick and secure payments using cards saved in your Google
                    wallet.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Security Notice */}
        <View className="px-4 mt-6">
          <Card extraStyle="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <View className="flex-row items-start">
              <Feather name="shield" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-blue-900">
                  Secure Investment
                </Text>
                <Text className="text-sm text-blue-700 mt-1">
                  Your investment is secured by blockchain technology and
                  processed through certified payment partners.
                </Text>
                {paymentMethods?.stripe.test_mode && (
                  <Text className="text-xs text-blue-600 mt-2 font-medium">
                    🧪 Test mode active - No real money will be charged
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InvestmentPaymentScreen: React.FC = () => {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <InvestmentPaymentContent />
    </StripeProvider>
  );
};

export default InvestmentPaymentScreen;
