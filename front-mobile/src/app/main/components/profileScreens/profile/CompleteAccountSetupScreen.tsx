// app/screens/CompleteAccountSetupScreen.tsx

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { TopBar, Card } from "@main/components/profileScreens/components/ui";
import {
  fetchVerificationStatus,
  fetchDetailedVerificationStatus,
  VerificationStatus,
  BackendVerificationStatus,
} from "@main/services/Verification";

export default function CompleteAccountSetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [detailedStatus, setDetailedStatus] = useState<BackendVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatuses = async () => {
    try {
      const [verificationStatus, detailedVerificationStatus] = await Promise.all([
        fetchVerificationStatus(),
        fetchDetailedVerificationStatus(),
      ]);
      setStatus(verificationStatus);
      setDetailedStatus(detailedVerificationStatus);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      // Set default status for new users (2/4 progress)
      setStatus({
        identity: { qualified: false },
        address: { qualified: false },
      });
      setDetailedStatus({
        userId: 1,
        identityStatus: 'pending',
        addressStatus: 'pending',
        overallStatus: 'incomplete',
        canProceed: true,
        nextStep: 'identity',
      });
    }
  };

  useEffect(() => {
    fetchStatuses().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatuses();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const { identity, address } = status!;
  const allDone = identity.qualified && address.qualified;
  
  // Get status messages and icons based on backend status
  const getStepInfo = (type: 'identity' | 'address') => {
    const backendStatus = type === 'identity' ? detailedStatus?.identityStatus : detailedStatus?.addressStatus;
    const submittedAt = type === 'identity' ? detailedStatus?.identitySubmittedAt : detailedStatus?.addressSubmittedAt;
    const rejectionReason = type === 'identity' ? detailedStatus?.identityRejectionReason : detailedStatus?.addressRejectionReason;
    
    switch (backendStatus) {
      case 'pending':
        return {
          icon: 'clock',
          color: '#6B7280',
          message: '2 mins',
          canProceed: true,
        };
      case 'under_review':
        return {
          icon: 'clock',
          color: '#F59E0B',
          message: 'Under review - We are verifying your documents',
          canProceed: false,
        };
      case 'approved':
        return {
          icon: 'check-circle',
          color: '#10B981',
          message: 'Verified successfully',
          canProceed: false,
        };
      case 'rejected':
        return {
          icon: 'x-circle',
          color: '#EF4444',
          message: rejectionReason || 'Verification failed - Please try again',
          canProceed: true,
        };
      default:
        return {
          icon: 'clock',
          color: '#6B7280',
          message: '2 mins',
          canProceed: true,
        };
    }
  };

  const identityInfo = getStepInfo('identity');
  const addressInfo = getStepInfo('address');

  const canContinue = detailedStatus?.canProceed || false;
  const nextStep = detailedStatus?.nextStep;

  const handleContinue = () => {
    if (nextStep === 'identity' || (!identity.qualified && identityInfo.canProceed)) {
      router.push(
        "main/components/profileScreens/profile/UploadPassportScreen"
      );
    } else if (nextStep === 'address' || (!address.qualified && addressInfo.canProceed)) {
      router.push("main/components/profileScreens/profile/UploadAddressScreen");
    }
  };

  const getMainMessage = () => {
    if (allDone) {
      return "Your information has been verified correctly!";
    } else if (detailedStatus?.overallStatus === 'under_review') {
      return "Your documents are under review. We'll notify you once the verification is complete.";
    } else if (detailedStatus?.overallStatus === 'rejected') {
      return "Some of your documents need to be resubmitted. Please check the details below.";
    } else {
      return "Regulations require us to verify your information before you can invest.";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TopBar
        title="Complete account setup"
        onBackPress={() => router.back()}
      />
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="pt-4 px-4">
          <Card>
            <Text className="text-lg font-bold text-gray-900">
              {getMainMessage()}
            </Text>
          </Card>

          <Card>
            {/* Steps 1 & 2 */}
            <View className="flex-row items-center mb-4">
              <Feather name="check-circle" size={24} color="#10B981" />
              <View className="ml-3">
                <Text className="text-sm text-gray-500">Step 1</Text>
                <Text className="text-base font-semibold text-gray-900">
                  Account created
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mb-4">
              <Feather name="check-circle" size={24} color="#10B981" />
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
                name={identityInfo.icon as any}
                size={24}
                color={identityInfo.color}
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Step 3</Text>
                <Text className="text-base font-semibold text-gray-900">
                  Verify your identity
                </Text>
              </View>
            </View>
            <Text className="text-xs text-gray-600 mb-4 ml-8">
              {identityInfo.message}
            </Text>

            {/* Step 4: address */}
            <View className="flex-row items-center mb-1">
              <Feather
                name={addressInfo.icon as any}
                size={24}
                color={addressInfo.color}
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">Step 4</Text>
                <Text className="text-base font-semibold text-gray-900">
                  Verify your address
                </Text>
              </View>
            </View>
            <Text className="text-xs text-gray-600 mb-4 ml-8">
              {addressInfo.message}
            </Text>
          </Card>

          {canContinue && !allDone && (
            <TouchableOpacity
              onPress={handleContinue}
              className="mt-6 rounded-xl p-4 items-center justify-center shadow-lg bg-black"
            >
              <Text className="text-base font-bold text-white">Continue</Text>
            </TouchableOpacity>
          )}

          {!canContinue && !allDone && (
            <TouchableOpacity
              onPress={() => router.push("/main/screens/(tabs)/profile")}
              className="mt-6 rounded-xl p-4 items-center justify-center shadow-lg bg-gray-300"
            >
              <Text className="text-base font-bold text-gray-600">
                Documents under review
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Tap to return to profile
              </Text>
            </TouchableOpacity>
          )}

          {!canContinue && !allDone && (
            <TouchableOpacity
              onPress={() => router.push("/main/screens/(tabs)/profile")}
              className="mt-3 bg-white border-2 border-gray-200 rounded-xl p-4 items-center justify-center shadow-lg"
            >
              <Text className="text-base font-bold text-gray-900">
                Back to Profile
              </Text>
            </TouchableOpacity>
          )}

          {canContinue && !allDone && (
            <TouchableOpacity
              onPress={() => router.push("/main/screens/(tabs)/profile")}
              className="mt-3 bg-white border-2 border-gray-200 rounded-xl p-4 items-center justify-center shadow-lg"
            >
              <Text className="text-base font-bold text-gray-900">
                Do this later
              </Text>
            </TouchableOpacity>
          )}

          {allDone && (
            <TouchableOpacity
              onPress={() => router.push("/main/screens/(tabs)/profile")}
              className="mt-6 rounded-xl p-4 items-center justify-center shadow-lg bg-green-600"
            >
              <Text className="text-base font-bold text-white">
                Continue to Dashboard
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
