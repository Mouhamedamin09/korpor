import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  CardField,
  useConfirmSetupIntent,
  SetupIntent,
} from "@stripe/stripe-react-native";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";

interface StripeCardFormProps {
  onSuccess: (setupIntent: any) => void;
  onCancel: () => void;
  onError: (error: string) => void;
  onProcessing?: (message: string) => void;
  clientSecret?: string;
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onSuccess,
  onCancel,
  onError,
  onProcessing,
  clientSecret,
}) => {
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmSetupIntent } = useConfirmSetupIntent();

  const handleSaveCard = async () => {
    if (!cardComplete || !cardDetails) {
      onError("Please complete your card information");
      return;
    }

    if (!clientSecret) {
      onError("Setup intent not available. Please try again.");
      return;
    }

    console.log("Card details before confirmation:", {
      complete: cardComplete,
      brand: cardDetails.brand,
      last4: cardDetails.last4,
      validNumber: cardDetails.validNumber,
      validCVC: cardDetails.validCVC,
      validExpiryDate: cardDetails.validExpiryDate,
    });

    try {
      setLoading(true);

      // Try confirming setup intent with payment method type
      // CardField should automatically create and attach the payment method
      const { error, setupIntent } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: "Card",
      });

      console.log("Setup intent confirmation result:", { error, setupIntent });

      if (error) {
        console.error("Setup intent confirmation error:", error);
        throw new Error(error.message);
      }

      if (setupIntent) {
        console.log("Setup intent status:", setupIntent.status);

        switch (String(setupIntent.status)) {
          case "Succeeded":
            console.log("✅ Setup intent succeeded");
            onSuccess(setupIntent);
            break;

          case "Processing":
            console.log("⏳ Setup intent is processing");
            if (onProcessing) {
              onProcessing(
                "Your payment method is being processed. This may take a few moments."
              );
            }
            // For processing status, we can still treat this as success
            // since the payment method will be available once processing completes
            onSuccess(setupIntent);
            break;

          case "RequiresAction":
            console.log("🔐 Setup intent requires additional action");
            throw new Error(
              "Please complete the authentication process to save your payment method."
            );

          case "RequiresConfirmation":
            console.log("⚠️ Setup intent requires confirmation");
            throw new Error(
              "Payment method setup requires confirmation. Please try again."
            );

          case "RequiresPaymentMethod":
            console.log("❌ Setup intent requires new payment method");
            throw new Error("Please check your payment details and try again.");

          case "Canceled":
            console.log("🚫 Setup intent was canceled");
            throw new Error(
              "Payment method setup was canceled. Please try again."
            );

          default:
            console.warn("❓ Unknown setup intent status:", setupIntent.status);
            throw new Error(
              `Setup intent has unexpected status: ${setupIntent.status}. Please try again.`
            );
        }
      } else {
        throw new Error("No setup intent returned from confirmation");
      }
    } catch (error) {
      console.error("Error confirming setup intent:", error);
      onError(
        error instanceof Error
          ? error.message
          : "Failed to save card information"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card extraStyle="p-6 bg-white rounded-2xl shadow-sm mx-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Add Card</Text>
        <TouchableOpacity onPress={onCancel}>
          <Feather name="x" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-gray-600 mb-4">
        Your card information is encrypted and secure
      </Text>

      <View className="mb-6">
        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: "4242 4242 4242 4242",
          }}
          cardStyle={{
            backgroundColor: "#FFFFFF",
            textColor: "#000000",
            fontSize: 16,
            placeholderColor: "#9CA3AF",
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 8,
          }}
          style={{
            width: "100%",
            height: 50,
            marginVertical: 8,
          }}
          onCardChange={(details) => {
            setCardDetails(details);
            setCardComplete(details.complete);
          }}
        />
      </View>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 bg-gray-100 rounded-xl py-3 items-center mr-2"
          onPress={onCancel}
          disabled={loading}
        >
          <Text className="text-gray-700 font-semibold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-xl py-3 items-center ${
            cardComplete && !loading ? "bg-green-600" : "bg-gray-300"
          }`}
          onPress={handleSaveCard}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold">Save Card</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center mt-4">
        <Image
          source={require("@assets/stripe.png")}
          style={{
            width: 80,
            height: 24,
            resizeMode: "contain",
            marginRight: 8,
          }}
        />
        <Text className="text-xs text-gray-500">Powered by Stripe</Text>
      </View>
    </Card>
  );
};

export default StripeCardForm;
