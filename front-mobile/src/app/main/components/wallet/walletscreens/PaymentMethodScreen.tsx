import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
// import StripeCardForm from "../compoenets/ui/StripeCardForm";
import {
  STRIPE_CONFIG,
  DEMO_CARDS,
  SETUP_INSTRUCTIONS,
} from "../config/stripe";

type PaymentMethodOption = {
  id: string;
  type: "stripe" | "ipayment";
  name: string;
  description: string;
  icon: "credit-card" | "smartphone" | "globe";
  enabled: boolean;
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "stripe_card",
    type: "stripe",
    name: "Credit/Debit Card",
    description: "Pay securely with Stripe (Coming Soon)",
    icon: "credit-card",
    enabled: false, // Temporarily disabled for testing
  },
  {
    id: "ipayment",
    type: "ipayment",
    name: "iPayment",
    description: "Pay with iPayment (Coming Soon)",
    icon: "smartphone",
    enabled: false,
  },
];

const PaymentMethodContent: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);

  const handleStripePayment = () => {
    Alert.alert(
      "Stripe Integration",
      "Stripe integration is temporarily disabled. We're working on resolving a native module issue. Please check back soon!",
      [{ text: "OK" }]
    );
  };

  const handleCardSuccess = (paymentMethod: any) => {
    setSavedCards((prev) => [...prev, paymentMethod]);
    setShowCardForm(false);
    Alert.alert(
      "Success!",
      "Your payment method has been added successfully.",
      [{ text: "OK" }]
    );
  };

  const handleIPayment = () => {
    Alert.alert(
      "iPayment",
      "iPayment integration is coming soon. This feature is currently in development.\n\nFeatures planned:\n• Mobile wallet payments\n• Bank transfers\n• Local payment methods",
      [{ text: "OK" }]
    );
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSavedCards((cards) =>
              cards.filter((card) => card.id !== cardId)
            );
            Alert.alert("Success", "Payment method removed successfully");
          },
        },
      ]
    );
  };

  const showDemoCards = () => {
    const cardList = Object.entries(DEMO_CARDS)
      .filter(([key]) => !["declined", "insufficientFunds"].includes(key))
      .map(([type, number]) => `${type.toUpperCase()}: ${number}`)
      .join("\n");

    Alert.alert(
      "Demo Test Cards",
      `These test card numbers will be available once Stripe is properly configured:\n\n${cardList}\n\nUse any future expiry date and any 3-digit CVC.`,
      [{ text: "OK" }]
    );
  };

  const addDemoCard = () => {
    const demoCard = {
      id: `demo_${Date.now()}`,
      card: {
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
      },
    };
    setSavedCards((prev) => [...prev, demoCard]);
    Alert.alert(
      "Demo Card Added",
      "A demo Visa card has been added for testing purposes."
    );
  };

  return (
    <View className="flex-1 bg-background">
      <TopBar
        title="Payment Methods"
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={showDemoCards}>
            <Feather name="info" size={20} color="#6B7280" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Add New Payment Method */}
        {!showCardForm && (
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Add Payment Method
            </Text>

            {/* Temporary Notice */}
            <Card extraStyle="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 mb-4">
              <View className="flex-row items-start">
                <Feather name="alert-triangle" size={20} color="#F59E0B" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-yellow-900">
                    Stripe Integration Notice
                  </Text>
                  <Text className="text-sm text-yellow-700 mt-1">
                    We're currently fixing a native module linking issue.
                    Payment methods will be available once resolved.
                  </Text>
                </View>
              </View>
            </Card>

            {PAYMENT_METHODS.map((method) => (
              <Card
                key={method.id}
                extraStyle="mb-4 p-4 bg-white rounded-2xl shadow-sm"
              >
                <TouchableOpacity
                  className={`flex-row items-center ${
                    !method.enabled ? "opacity-50" : ""
                  }`}
                  onPress={() => {
                    if (!method.enabled) return;

                    if (method.type === "stripe") {
                      handleStripePayment();
                    } else if (method.type === "ipayment") {
                      handleIPayment();
                    }
                  }}
                  disabled={!method.enabled || loading}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    <Feather name={method.icon} size={24} color="#374151" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {method.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {method.description}
                    </Text>
                  </View>

                  {method.enabled && (
                    <Feather name="plus" size={20} color="#10B981" />
                  )}
                  {!method.enabled && (
                    <Text className="text-xs text-gray-400 font-medium">
                      Coming Soon
                    </Text>
                  )}
                </TouchableOpacity>
              </Card>
            ))}

            {/* Demo Card Button */}
            <Card extraStyle="p-4 bg-green-50 rounded-2xl border border-green-200">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={addDemoCard}
              >
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                  <Feather name="plus" size={24} color="#10B981" />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-green-900">
                    Add Demo Card
                  </Text>
                  <Text className="text-sm text-green-700">
                    Add a demo card for testing purposes
                  </Text>
                </View>

                <Feather name="plus" size={20} color="#10B981" />
              </TouchableOpacity>
            </Card>

            {loading && (
              <View className="flex-row items-center justify-center py-4">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="ml-2 text-gray-600">Processing...</Text>
              </View>
            )}
          </View>
        )}

        {/* Saved Payment Methods */}
        {!showCardForm && (
          <View className="px-4 mt-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Saved Payment Methods
            </Text>

            {savedCards.length === 0 ? (
              <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm">
                <View className="items-center">
                  <Feather name="credit-card" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 text-center mt-4 mb-2">
                    No payment methods added yet
                  </Text>
                  <Text className="text-gray-400 text-center text-sm">
                    Add a payment method to make deposits and withdrawals easier
                  </Text>
                </View>
              </Card>
            ) : (
              savedCards.map((card) => (
                <Card
                  key={card.id}
                  extraStyle="mb-3 p-4 bg-white rounded-2xl shadow-sm"
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center mr-4">
                      <Image
                        source={
                          card.card.brand === "visa"
                            ? require("@assets/visa.png")
                            : require("@assets/mastercard.png")
                        }
                        style={{ width: 32, height: 20 }}
                        resizeMode="contain"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        •••• •••• •••• {card.card.last4}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Expires {card.card.expiryMonth}/{card.card.expiryYear}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveCard(card.id)}
                      className="p-2"
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Payment Method Information */}
        {!showCardForm && (
          <View className="px-4 mt-6">
            <Card extraStyle="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <View className="flex-row items-start">
                <Feather name="info" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-blue-900">
                    Secure Payment Processing
                  </Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    All payments are processed securely through Stripe and
                    iPayment. Your card information is encrypted and never
                    stored on our servers.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Supported Cards */}
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
              <View className="w-16 h-10 rounded-lg border border-gray-200 items-center justify-center bg-white">
                <Feather name="smartphone" size={20} color="#374151" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const PaymentMethodScreen: React.FC = () => {
  // Temporarily removing StripeProvider to avoid native module errors
  return <PaymentMethodContent />;

  // Uncomment this when Stripe is properly configured:
  // return (
  //   <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
  //     <PaymentMethodContent />
  //   </StripeProvider>
  // );
};

export default PaymentMethodScreen;
