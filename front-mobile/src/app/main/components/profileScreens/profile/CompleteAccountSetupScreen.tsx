// app/screens/CompleteAccountSetupScreen.tsx

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import {
  fetchVerificationStatus,
  VerificationStatus,
} from "@main/services/Verification";

export default function CompleteAccountSetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus()
      .then((s) => setStatus(s))
      .catch(() =>
        setStatus({
          identity: {
            qualified: false,
            message: "Could not fetch status.",
          },
          address: { qualified: false },
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const { identity, address } = status!;
  const allDone = identity.qualified && address.qualified;
  // only disable if *both* are submitted & both unqualified
  const nextDisabled =
    !!identity.message &&
    !identity.qualified &&
    !!address.message &&
    !address.qualified;

  const handleContinue = () => {
    if (!identity.qualified) {
      router.push(
        "main/components/profileScreens/profile/UploadPassportScreen"
      );
    } else if (!address.qualified) {
      router.push("main/components/profileScreens/profile/UploadAddressScreen");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <TopBar
        title="Complete account setup"
        onBackPress={() => router.back()}
      />
      <View className="pt-4 px-4">
        <Card>
          <Text className="text-lg font-bold text-gray-900">
            {allDone
              ? "Your information has been verified correctly!"
              : "Regulations require us to verify your information before you can invest."}
          </Text>
        </Card>

        <Card>
          {/* Steps 1 & 2 */}
          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-500">Step 1</Text>
              <Text className="text-base font-semibold text-gray-900">
                Account created
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mb-4">
            <Feather name="check-circle" size={24} color="#000" />
            <View className="ml-3">
              <Text className="text-sm text-gray-500">Step 2</Text>
              <Text className="text-base font-semibold text-gray-900">
                Tell us about your employment
              </Text>
            </View>
          </View>

          {/* Step 3: identity */}
          <View className="flex-row items-center mb-1">
            <Feather
              name={identity.qualified ? "check-circle" : "clock"}
              size={24}
              color="#000"
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-gray-500">Step 3</Text>
              <Text className="text-base font-semibold text-gray-900">
                Verify your identity
              </Text>
              {!identity.qualified && !identity.message && (
                <Text className="text-sm text-gray-500">2 mins</Text>
              )}
            </View>
          </View>
          {identity.message && !identity.qualified && (
            <Text className="text-xs text-red-500 mb-4">
              {identity.message}
            </Text>
          )}

          {/* Step 4: address */}
          <View className="flex-row items-center">
            <Feather
              name={address.qualified ? "check-circle" : "clock"}
              size={24}
              color="#000"
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-gray-500">Step 4</Text>
              <Text className="text-base font-semibold text-gray-900">
                Verify your address
              </Text>
              {!address.qualified && !address.message && (
                <Text className="text-sm text-gray-500">2 mins</Text>
              )}
            </View>
          </View>
          {address.message && !address.qualified && (
            <Text className="text-xs text-red-500 mb-4">{address.message}</Text>
          )}
        </Card>

        {!allDone && (
          <TouchableOpacity
            onPress={handleContinue}
            disabled={nextDisabled}
            className={`mt-6 rounded-xl p-4 items-center justify-center shadow-lg ${
              nextDisabled ? "bg-gray-300" : "bg-black"
            }`}
          >
            <Text className="text-base font-bold text-white">Continue</Text>
          </TouchableOpacity>
        )}

        {!allDone && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-3 bg-white border-2 border-gray-200 rounded-xl p-4 items-center justify-center shadow-lg"
          >
            <Text className="text-base font-bold text-gray-900">
              Do this later
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
