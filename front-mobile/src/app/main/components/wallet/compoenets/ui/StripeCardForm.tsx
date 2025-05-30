import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CardField, useConfirmSetupIntent } from "@stripe/stripe-react-native";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";

interface StripeCardFormProps {
  onSuccess: (paymentMethod: any) => void;
  onCancel: () => void;
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmSetupIntent } = useConfirmSetupIntent();

  const handleSaveCard = async () => {
    if (!cardComplete || !cardDetails) {
      Alert.alert("Error", "Please complete your card information");
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, you would:
      // 1. Call your backend to create a setup intent
      // 2. Get the client secret
      // 3. Confirm the setup intent with the card

      // For now, we'll simulate this process
      Alert.alert(
        "Demo Mode",
        "In a real implementation, this would save your card securely with Stripe. The card details would be tokenized and stored safely.",
        [
          {
            text: "Simulate Success",
            onPress: () => {
              const mockPaymentMethod = {
                id: `pm_${Date.now()}`,
                type: "card",
                card: {
                  brand: cardDetails.brand || "visa",
                  last4: cardDetails.last4 || "4242",
                  expiryMonth: cardDetails.expiryMonth || 12,
                  expiryYear: cardDetails.expiryYear || 2025,
                },
              };
              onSuccess(mockPaymentMethod);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save card information");
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
          className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
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
        <Feather name="lock" size={16} color="#10B981" />
        <Text className="text-xs text-gray-500 ml-2">Secured by Stripe</Text>
      </View>
    </Card>
  );
};

export default StripeCardForm;
