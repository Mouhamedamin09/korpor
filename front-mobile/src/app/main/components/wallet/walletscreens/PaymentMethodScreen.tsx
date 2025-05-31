import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import {
  StripeProvider,
  useStripe,
  useConfirmSetupIntent,
  usePlatformPay,
  PlatformPayButton,
  PlatformPay,
} from "@stripe/stripe-react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import StripeCardForm from "../compoenets/ui/StripeCardForm";
import {
  getPaymentMethods,
  createPaymePayment,
  getStripeTestCards,
  getSavedPaymentMethods,
  createStripeSetupIntent,
  saveStripePaymentMethod,
  deleteSavedPaymentMethod,
  setDefaultPaymentMethod,
  formatCardDisplay,
  type PaymentMethods,
  type StripeTestCards,
  type SavedPaymentMethod,
  type PaymentMethod as PaymentMethodType,
} from "@main/services/payment.service";
import { fetchAccountData } from "@main/services/account";

type PaymentMethodOption = {
  id: PaymentMethodType;
  type: PaymentMethodType;
  name: string;
  description: string;
  icon: "credit-card" | "smartphone";
  enabled: boolean;
  test_mode?: boolean;
  processing_time?: string;
  fees?: string;
};

const PaymentMethodContent: React.FC = () => {
  const router = useRouter();
  const { confirmSetupIntent } = useConfirmSetupIntent();
  const { isPlatformPaySupported, confirmPlatformPaySetupIntent } =
    usePlatformPay();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<
    string | null
  >(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(
    null
  );
  const [stripeTestCards, setStripeTestCards] =
    useState<StripeTestCards | null>(null);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  // Bottom sheet states
  const [removeCardSheetVisible, setRemoveCardSheetVisible] = useState(false);
  const [testCardsSheetVisible, setTestCardsSheetVisible] = useState(false);
  const [successSheetVisible, setSuccessSheetVisible] = useState(false);
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [paymeSheetVisible, setPaymeSheetVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<SavedPaymentMethod | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load payment methods and test data on component mount
  useEffect(() => {
    loadPaymentData();
  }, []);

  // Check for Google Pay and Apple Pay support
  useEffect(() => {
    checkPlatformPaySupport();
  }, []);

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
      } else if (Platform.OS === "ios") {
        // Check Apple Pay support
        const applePaySupported = await isPlatformPaySupported();
        setIsApplePaySupported(applePaySupported);
      }
    } catch (error) {
      console.error("Error checking platform pay support:", error);
    }
  };

  const loadPaymentData = async () => {
    try {
      setInitialLoading(true);

      // Load all payment data in parallel
      const [methods, testCards, savedMethods, account] = await Promise.all([
        getPaymentMethods(),
        getStripeTestCards().catch(() => null),
        getSavedPaymentMethods().catch(() => []),
        fetchAccountData().catch(() => null),
      ]);

      setPaymentMethods(methods);
      setStripeTestCards(testCards);
      setSavedPaymentMethods(savedMethods);
      setUserAccount(account);

      // Check platform pay support after payment methods are loaded
      if (methods) {
        await checkPlatformPaySupport();
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
      setErrorMessage(
        "Failed to load payment methods. Please check your connection and try again."
      );
      setErrorSheetVisible(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);

      if (!userAccount) {
        throw new Error("User account not loaded");
      }

      // Create setup intent first
      const setupIntent = await createStripeSetupIntent({
        email: userAccount.email,
        name: userAccount.name || userAccount.email,
        walletAddress:
          userAccount.walletAddress ||
          "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      });

      console.log("Setup intent created:", {
        setup_intent_id: setupIntent.setup_intent_id,
        client_secret: setupIntent.client_secret ? "✓ Present" : "✗ Missing",
        test_mode: setupIntent.test_mode,
      });

      setSetupIntentClientSecret(setupIntent.client_secret);
      setShowCardForm(true);
    } catch (error) {
      console.error("Error creating setup intent:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to initialize card form"
      );
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePaySetup = async () => {
    try {
      setLoading(true);

      if (!userAccount) {
        throw new Error("User account not loaded");
      }

      // Create setup intent for Google Pay
      const setupIntent = await createStripeSetupIntent({
        email: userAccount.email,
        name: userAccount.name || userAccount.email,
        walletAddress:
          userAccount.walletAddress ||
          "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      });

      // Confirm setup intent with Google Pay
      const { error, setupIntent: confirmedSetupIntent } =
        await confirmPlatformPaySetupIntent(setupIntent.client_secret, {
          googlePay: {
            testEnv: paymentMethods?.stripe.test_mode || true,
            merchantName: "Korpor",
            merchantCountryCode: "US",
            currencyCode: "USD",
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      if (
        confirmedSetupIntent &&
        String(confirmedSetupIntent.status) === "succeeded"
      ) {
        // Save the payment method to backend
        const savedMethod = await saveStripePaymentMethod(
          confirmedSetupIntent.id,
          savedPaymentMethods.length === 0 // Set as default if it's the first card
        );

        // Update local state
        setSavedPaymentMethods((prev) => [...prev, savedMethod]);

        setSuccessMessage(
          "Your Google Pay payment method has been saved successfully."
        );
        setSuccessSheetVisible(true);
      } else {
        throw new Error("Failed to confirm setup intent");
      }
    } catch (error) {
      console.error("Error setting up Google Pay:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add Google Pay"
      );
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApplePaySetup = async () => {
    try {
      setLoading(true);

      if (!userAccount) {
        throw new Error("User account not loaded");
      }

      // Create setup intent for Apple Pay
      const setupIntent = await createStripeSetupIntent({
        email: userAccount.email,
        name: userAccount.name || userAccount.email,
        walletAddress:
          userAccount.walletAddress ||
          "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      });

      // Confirm setup intent with Apple Pay
      const { error, setupIntent: confirmedSetupIntent } =
        await confirmPlatformPaySetupIntent(setupIntent.client_secret, {
          applePay: {
            cartItems: [
              {
                label: "Payment Method Setup",
                amount: "0.00",
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
            merchantCountryCode: "US",
            currencyCode: "USD",
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      if (
        confirmedSetupIntent &&
        String(confirmedSetupIntent.status) === "succeeded"
      ) {
        // Save the payment method to backend
        const savedMethod = await saveStripePaymentMethod(
          confirmedSetupIntent.id,
          savedPaymentMethods.length === 0 // Set as default if it's the first card
        );

        // Update local state
        setSavedPaymentMethods((prev) => [...prev, savedMethod]);

        setSuccessMessage(
          "Your Apple Pay payment method has been saved successfully."
        );
        setSuccessSheetVisible(true);
      } else {
        throw new Error("Failed to confirm setup intent");
      }
    } catch (error) {
      console.error("Error setting up Apple Pay:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to add Apple Pay"
      );
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSuccess = async (confirmedSetupIntent: any) => {
    try {
      setLoading(true);

      // Save the payment method to backend
      const savedMethod = await saveStripePaymentMethod(
        confirmedSetupIntent.id,
        savedPaymentMethods.length === 0 // Set as default if it's the first card
      );

      // Update local state
      setSavedPaymentMethods((prev) => [...prev, savedMethod]);
      setShowCardForm(false);
      setSetupIntentClientSecret(null);

      setSuccessMessage("Your payment method has been saved successfully.");
      setSuccessSheetVisible(true);
    } catch (error) {
      console.error("Error saving card:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save payment method"
      );
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayMePayment = async () => {
    try {
      setLoading(true);

      // Call the backend to get PayMe status
      const response = await createPaymePayment({
        amount: 100, // Mock amount
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Mock wallet
        note: "Payment method setup",
      });

      setPaymeSheetVisible(true);
    } catch (error) {
      console.error("PayMe error:", error);
      setPaymeSheetVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = (paymentMethod: SavedPaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setRemoveCardSheetVisible(true);
  };

  const confirmRemoveCard = async () => {
    if (!selectedPaymentMethod) return;

    try {
      await deleteSavedPaymentMethod(selectedPaymentMethod.id);
      setSavedPaymentMethods((methods) =>
        methods.filter((method) => method.id !== selectedPaymentMethod.id)
      );
      setRemoveCardSheetVisible(false);
      setSelectedPaymentMethod(null);
      setSuccessMessage("Payment method removed successfully");
      setSuccessSheetVisible(true);
    } catch (error) {
      setRemoveCardSheetVisible(false);
      setErrorMessage("Failed to remove payment method");
      setErrorSheetVisible(true);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);

      // Update local state
      setSavedPaymentMethods((methods) =>
        methods.map((method) => ({
          ...method,
          is_default: method.id === paymentMethodId,
        }))
      );

      setSuccessMessage("Default payment method updated");
      setSuccessSheetVisible(true);
    } catch (error) {
      setErrorMessage("Failed to update default payment method");
      setErrorSheetVisible(true);
    }
  };

  const showStripeTestCards = () => {
    if (!stripeTestCards) {
      setErrorMessage("Test card information is not available at the moment.");
      setErrorSheetVisible(true);
      return;
    }

    setTestCardsSheetVisible(true);
  };

  // Convert backend payment methods to local format
  const getPaymentMethodOptions = (): PaymentMethodOption[] => {
    if (!paymentMethods) return [];

    const options: PaymentMethodOption[] = [
      {
        id: "stripe" as PaymentMethodType,
        type: "stripe" as PaymentMethodType,
        name: paymentMethods.stripe.name,
        description: paymentMethods.stripe.description,
        icon: "credit-card",
        enabled: paymentMethods.stripe.enabled,
        test_mode: paymentMethods.stripe.test_mode,
        processing_time: paymentMethods.stripe.processing_time,
        fees: paymentMethods.stripe.fees,
      },
      {
        id: "payme" as PaymentMethodType,
        type: "payme" as PaymentMethodType,
        name: paymentMethods.payme.name,
        description: paymentMethods.payme.description,
        icon: "smartphone",
        enabled: paymentMethods.payme.enabled,
        processing_time: paymentMethods.payme.processing_time,
        fees: paymentMethods.payme.fees,
      },
    ];

    return options;
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Payment Methods" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-600 mt-4">Loading payment methods...</Text>
        </View>
      </View>
    );
  }

  const paymentMethodOptions = getPaymentMethodOptions();

  return (
    <View className="flex-1 bg-background">
      <TopBar
        title="Payment Methods"
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={showStripeTestCards}>
            <Feather name="info" size={20} color="#6B7280" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Stripe Card Form */}
        {showCardForm && (
          <View className="mt-4">
            <StripeCardForm
              onSuccess={handleCardSuccess}
              onCancel={() => {
                setShowCardForm(false);
                setSetupIntentClientSecret(null);
              }}
              clientSecret={setupIntentClientSecret ?? undefined}
            />
          </View>
        )}

        {/* Saved Payment Methods */}
        {!showCardForm && savedPaymentMethods.length > 0 && (
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Saved Payment Methods
            </Text>

            {savedPaymentMethods.map((method) => (
              <Card
                key={method.id}
                extraStyle="mb-3 p-4 bg-white rounded-2xl shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                      <Feather
                        name={
                          method.type === "stripe"
                            ? "credit-card"
                            : "smartphone"
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
                      {method.type === "payme" && method.payme && (
                        <>
                          <Text className="text-base font-semibold text-gray-900">
                            PayMe {method.payme.phone_number}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {method.payme.account_name}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    {!method.is_default && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(method.id)}
                        className="p-2 mr-2"
                      >
                        <Feather name="star" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveCard(method)}
                      className="p-2"
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Add New Payment Method */}
        {!showCardForm && (
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Add Payment Method
            </Text>

            {/* Google Pay Button (Android) */}
            {Platform.OS === "android" && isGooglePaySupported && (
              <Card extraStyle="mb-4 p-4 bg-white rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                      <Feather name="credit-card" size={24} color="#4285F4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        Google Pay
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Use cards saved in Google Pay
                      </Text>
                      {paymentMethods?.stripe.test_mode && (
                        <Text className="text-xs text-blue-600 mt-1">
                          Test mode - Your cards won't be charged
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <PlatformPayButton
                  type={PlatformPay.ButtonType.SetUp}
                  onPress={handleGooglePaySetup}
                  style={{
                    width: "100%",
                    height: 50,
                  }}
                  disabled={loading}
                />
              </Card>
            )}

            {/* Apple Pay Button (iOS) */}
            {Platform.OS === "ios" && isApplePaySupported && (
              <Card extraStyle="mb-4 p-4 bg-white rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                      <Feather name="smartphone" size={24} color="#000" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        Apple Pay
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Use cards saved in Apple Wallet
                      </Text>
                      {paymentMethods?.stripe.test_mode && (
                        <Text className="text-xs text-blue-600 mt-1">
                          Test mode - Your cards won't be charged
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <PlatformPayButton
                  type={PlatformPay.ButtonType.SetUp}
                  onPress={handleApplePaySetup}
                  style={{
                    width: "100%",
                    height: 50,
                  }}
                  disabled={loading}
                />
              </Card>
            )}

            {/* Regular Payment Methods */}
            {paymentMethodOptions.map((method) => (
              <Card
                key={method.id}
                extraStyle="mb-4 p-4 bg-white rounded-2xl shadow-sm"
              >
                <TouchableOpacity
                  className={`flex-row items-center ${
                    !method.enabled ? "opacity-50" : ""
                  }`}
                  onPress={() => {
                    if (!method.enabled || loading) return;

                    if (method.type === "stripe") {
                      handleStripePayment();
                    } else if (method.type === "payme") {
                      handlePayMePayment();
                    }
                  }}
                  disabled={!method.enabled || loading}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <Feather name={method.icon} size={24} color="#374151" />
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
                    {method.fees && (
                      <Text className="text-xs text-gray-500">
                        Fees: {method.fees}
                      </Text>
                    )}
                  </View>

                  {method.enabled && !loading && (
                    <Feather name="plus" size={20} color="#10B981" />
                  )}
                  {!method.enabled && (
                    <Text className="text-xs text-gray-400 font-medium">
                      Coming Soon
                    </Text>
                  )}
                  {loading && method.type === "payme" && (
                    <ActivityIndicator size="small" color="#10B981" />
                  )}
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* Platform Pay Information */}
        {!showCardForm && (isGooglePaySupported || isApplePaySupported) && (
          <View className="px-4 mt-4">
            <Card extraStyle="p-4 bg-green-50 rounded-2xl border border-green-200">
              <View className="flex-row items-start">
                <Feather name="check-circle" size={20} color="#10B981" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-green-900">
                    {Platform.OS === "android" ? "Google Pay" : "Apple Pay"}{" "}
                    Available
                  </Text>
                  <Text className="text-sm text-green-700 mt-1">
                    You can use cards saved in your{" "}
                    {Platform.OS === "android" ? "Google" : "Apple"} wallet for
                    quick and secure payments. Your card details are never
                    shared with merchants.
                  </Text>
                  {isGooglePaySupported && (
                    <Text className="text-xs text-green-600 mt-2">
                      💡 Google Pay supports cards from Google Play, YouTube,
                      Chrome, and your Android device
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Security Information */}
        {!showCardForm && (
          <View className="px-4 mt-6">
            <Card extraStyle="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <View className="flex-row items-start">
                <Feather name="shield" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-blue-900">
                    Secure Payment Processing
                  </Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    All payments are processed securely through our certified
                    payment partners. Your card information is encrypted and
                    never stored on our servers.
                  </Text>
                  {paymentMethods?.stripe.test_mode && (
                    <Text className="text-xs text-blue-600 mt-2 font-medium">
                      🧪 Currently running in test mode for development
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Supported Payment Methods */}
        {!showCardForm && (
          <View className="px-4 mt-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Supported Payment Methods
            </Text>

            <View className="flex-row justify-center space-x-4">
              <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                <Image
                  source={require("@assets/visa.png")}
                  style={{ width: 40, height: 14 }}
                  resizeMode="contain"
                />
              </View>
              <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                <Image
                  source={require("@assets/mastercard.png")}
                  style={{ width: 28, height: 20 }}
                  resizeMode="contain"
                />
              </View>
              {Platform.OS === "android" && isGooglePaySupported && (
                <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                  <Feather name="credit-card" size={20} color="#4285F4" />
                </View>
              )}
              {Platform.OS === "ios" && isApplePaySupported && (
                <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                  <Feather name="smartphone" size={20} color="#000" />
                </View>
              )}
              <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                <Feather name="smartphone" size={20} color="#374151" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Remove Card Confirmation Bottom Sheet */}
      <BottomSheet
        visible={removeCardSheetVisible}
        onClose={() => setRemoveCardSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="trash-2" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Remove Payment Method
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to remove this payment method?
          </Text>
          {selectedPaymentMethod && (
            <View className="bg-gray-50 p-3 rounded-lg mb-6 w-full">
              <Text className="text-sm font-semibold text-gray-900">
                {selectedPaymentMethod.type === "stripe" &&
                  selectedPaymentMethod.card &&
                  formatCardDisplay(
                    selectedPaymentMethod.card.brand,
                    selectedPaymentMethod.card.last4,
                    selectedPaymentMethod.card.exp_month,
                    selectedPaymentMethod.card.exp_year
                  )}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={confirmRemoveCard}
            className="bg-red-600 rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRemoveCardSheetVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Test Cards Bottom Sheet */}
      <BottomSheet
        visible={testCardsSheetVisible}
        onClose={() => setTestCardsSheetVisible(false)}
      >
        <View className="pb-6">
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Feather name="credit-card" size={28} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              Stripe Test Cards 💳
            </Text>
          </View>
          {stripeTestCards && (
            <>
              <Text className="text-sm text-gray-600 text-center mb-4">
                {stripeTestCards.message}
              </Text>
              <View className="space-y-2 mb-4">
                {Object.entries(stripeTestCards.cards)
                  .filter(
                    ([key]) => !["declined", "insufficientFunds"].includes(key)
                  )
                  .map(([type, number]) => (
                    <View
                      key={type}
                      className="flex-row justify-between p-2 bg-gray-50 rounded"
                    >
                      <Text className="text-sm font-semibold text-gray-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}:
                      </Text>
                      <Text className="text-sm text-gray-600">{number}</Text>
                    </View>
                  ))}
              </View>
              <View className="mb-4">
                {stripeTestCards.instructions.map((instruction, index) => (
                  <Text key={index} className="text-xs text-gray-500 mb-1">
                    • {instruction}
                  </Text>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity
            onPress={() => setTestCardsSheetVisible(false)}
            className="bg-blue-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Success Bottom Sheet */}
      <BottomSheet
        visible={successSheetVisible}
        onClose={() => setSuccessSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check-circle" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Success! 🎉
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {successMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setSuccessSheetVisible(false)}
            className="bg-green-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Error Bottom Sheet */}
      <BottomSheet
        visible={errorSheetVisible}
        onClose={() => setErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="x-circle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Error
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setErrorSheetVisible(false)}
            className="bg-red-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* PayMe Coming Soon Bottom Sheet */}
      <BottomSheet
        visible={paymeSheetVisible}
        onClose={() => setPaymeSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
            <Feather name="smartphone" size={28} color="#F59E0B" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            PayMe - Coming Soon! 🚧
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            PayMe integration is coming soon! We're working hard to bring you
            this payment option.
          </Text>
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Features planned:
          </Text>
          <View className="w-full mb-6">
            {[
              "Mobile wallet payments",
              "Bank transfers",
              "Local payment methods",
              "QR code payments",
            ].map((feature, index) => (
              <Text key={index} className="text-sm text-gray-600 mb-1">
                • {feature}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setPaymeSheetVisible(false)}
            className="bg-orange-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

const PaymentMethodScreen: React.FC = () => {
  return (
    <StripeProvider
      publishableKey={
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        "pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn"
      }
    >
      <PaymentMethodContent />
    </StripeProvider>
  );
};

export default PaymentMethodScreen;
