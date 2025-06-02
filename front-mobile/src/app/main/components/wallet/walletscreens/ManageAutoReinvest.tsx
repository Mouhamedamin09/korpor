import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import { BottomSheet } from "@main/components/profileScreens/components/ui";
import {
  AutoReinvestPlan,
  getAutoReinvest,
  toggleAutoReinvest,
  cancelAutoReinvest,
  getRentalHistory,
  RentalPayout,
} from "../../../services/autoReinvest";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-green-100", text: "text-green-800" },
    paused: { bg: "bg-yellow-100", text: "text-yellow-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  const statusColor = colors[status] || colors.active;

  return (
    <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
      <Text className={`text-xs font-medium capitalize ${statusColor.text}`}>
        {status}
      </Text>
    </View>
  );
};

const ActivePlanCard = ({
  plan,
  rentalPayouts,
  onToggle,
  onCancel,
}: {
  plan: AutoReinvestPlan;
  rentalPayouts: RentalPayout[];
  onToggle: (action: "pause" | "resume") => void;
  onCancel: () => void;
}) => {
  const totalRentalIncome = rentalPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );
  const totalReinvested = rentalPayouts.reduce(
    (sum, payout) => sum + payout.reinvestedAmount,
    0
  );
  const lastPayoutDate =
    rentalPayouts.length > 0
      ? new Date(rentalPayouts[0].payoutDate).toLocaleDateString()
      : "N/A";

  const themeNames = {
    growth: "Growth Focus",
    income: "Income Focus",
    balanced: "Balanced",
    diversified: "Diversified",
    index: "Index",
  };

  const themeName =
    themeNames[plan.theme as keyof typeof themeNames] || plan.theme;

  return (
    <View className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-900">{themeName}</Text>
        <StatusBadge status={plan.status} />
      </View>

      {/* Reinvestment percentage */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-green-600 mb-1">
          {plan.reinvestPercentage}%
        </Text>
        <Text className="text-sm text-gray-500">
          of rental income reinvested
        </Text>
      </View>

      {/* Totals */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Total Rental Income</Text>
          <Text className="text-base font-semibold text-gray-900">
            {totalRentalIncome.toLocaleString()} TND
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Total Reinvested</Text>
          <Text className="text-base font-semibold text-green-600">
            {totalReinvested.toLocaleString()} TND
          </Text>
        </View>
      </View>

      {/* Settings & Last Payout */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Minimum Amount</Text>
          <Text className="text-base font-semibold text-gray-900">
            {plan.minimumReinvestAmount} TND
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Last Payout</Text>
          <Text className="text-base font-semibold text-gray-900">
            {lastPayoutDate}
          </Text>
        </View>
      </View>

      {/* Settings Details */}
      <View className="bg-gray-50 rounded-lg p-4 mb-4">
        <Text className="text-sm font-medium text-gray-900 mb-2">Settings</Text>
        <View className="space-y-1">
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">Risk Level:</Text>
            <Text className="text-xs font-medium text-gray-900 capitalize">
              {plan.riskLevel}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">Frequency:</Text>
            <Text className="text-xs font-medium text-gray-900 capitalize">
              {plan.reinvestmentFrequency}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">Auto Approval:</Text>
            <Text className="text-xs font-medium text-gray-900">
              {plan.autoApprovalEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">Max per Project:</Text>
            <Text className="text-xs font-medium text-gray-900">
              {plan.maxReinvestPercentagePerProject}%
            </Text>
          </View>
        </View>
      </View>

      {/* Only show controls if NOT cancelled */}
      {plan.status !== "cancelled" && (
        <View className="border-t border-gray-100 pt-4">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-lg border ${
                plan.status === "active"
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-green-300 bg-green-50"
              }`}
              onPress={() =>
                onToggle(plan.status === "active" ? "pause" : "resume")
              }
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-medium ${
                  plan.status === "active"
                    ? "text-yellow-700"
                    : "text-green-700"
                }`}
              >
                {plan.status === "active" ? "Pause" : "Resume"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 px-4 ml-2 rounded-lg border border-red-300 bg-red-50"
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text className="text-center font-medium text-red-700">
                Cancel Plan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const ManageAutoReinvest: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plan, setPlan] = useState<AutoReinvestPlan | null>(null);
  const [rentalPayouts, setRentalPayouts] = useState<RentalPayout[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Bottom sheet states
  const [successSheetVisible, setSuccessSheetVisible] = useState(false);
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [cancelSuccessVisible, setCancelSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentAction, setCurrentAction] = useState<"pause" | "resume" | null>(
    null
  );

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const [autoReinvestData, rentalHistory] = await Promise.all([
        getAutoReinvest(),
        getRentalHistory(1, 10),
      ]);

      if (autoReinvestData.autoReinvestPlan) {
        setPlan(autoReinvestData.autoReinvestPlan);
      }
      setRentalPayouts(rentalHistory.rentalPayouts);
    } catch (err) {
      console.error("Error loading AutoReinvest data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (action: "pause" | "resume") => {
    try {
      setCurrentAction(action);
      const result = await toggleAutoReinvest(action);

      // Update local state
      if (plan) {
        setPlan({ ...plan, status: result.status as any });
      }

      setSuccessMessage(
        `AutoReinvest plan ${
          action === "pause" ? "paused" : "resumed"
        } successfully!`
      );
      setSuccessSheetVisible(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update plan"
      );
      setErrorSheetVisible(true);
    }
  };

  const handleCancel = () => {
    setCancelConfirmVisible(true);
  };

  const confirmCancel = async () => {
    try {
      setCancelConfirmVisible(false);
      await cancelAutoReinvest();

      // Update local state
      if (plan) {
        setPlan({ ...plan, status: "cancelled" });
      }

      setCancelSuccessVisible(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to cancel plan"
      );
      setErrorSheetVisible(true);
    }
  };

  const handleSuccessOk = () => {
    setSuccessSheetVisible(false);
    setCurrentAction(null);
  };

  const handleCancelSuccessOk = () => {
    setCancelSuccessVisible(false);
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <TopBar title="Manage AutoReinvest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading your plan...</Text>
        </View>
      </View>
    );
  }

  if (error && !plan) {
    return (
      <View className="flex-1 bg-gray-50">
        <TopBar title="Manage AutoReinvest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-4">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="text-gray-900 text-lg font-semibold mt-4 mb-2 text-center">
            Error Loading Plan
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={() => loadData()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <View className="flex-1 bg-gray-50">
        <TopBar title="Manage AutoReinvest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-4">
          <Feather name="refresh-ccw" size={48} color="#6B7280" />
          <Text className="text-gray-900 text-lg font-semibold mt-4 mb-2 text-center">
            No AutoReinvest Plan
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            You don't have an active AutoReinvest plan set up yet.
          </Text>
          <TouchableOpacity
            className="bg-green-600 px-6 py-3 rounded-lg"
            onPress={() =>
              router.push(
                "/main/components/wallet/walletscreens/StartAutoReinvest"
              )
            }
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium">Create Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <TopBar title="Manage AutoReinvest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ActivePlanCard
          plan={plan}
          rentalPayouts={rentalPayouts}
          onToggle={handleToggle}
          onCancel={handleCancel}
        />

        {/* Recent Payouts */}
        {rentalPayouts.length > 0 && (
          <View className="bg-white rounded-lg p-4 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Recent Rental Payouts
            </Text>
            {rentalPayouts.slice(0, 5).map((payout) => (
              <View
                key={payout.id}
                className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">
                    {payout.project?.title || `Project ${payout.projectId}`}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(payout.payoutDate).toLocaleDateString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold text-gray-900">
                    {payout.amount.toLocaleString()} TND
                  </Text>
                  {payout.reinvestedAmount > 0 && (
                    <Text className="text-sm text-green-600">
                      Reinvested: {payout.reinvestedAmount.toLocaleString()} TND
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
            Success!
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            {successMessage}
          </Text>
          <TouchableOpacity
            onPress={handleSuccessOk}
            className="bg-green-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
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
            <Feather name="alert-circle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Error
          </Text>
          <Text className="text-center text-gray-600 mb-6">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setErrorSheetVisible(false)}
            className="bg-red-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Cancel Confirmation Bottom Sheet */}
      <BottomSheet
        visible={cancelConfirmVisible}
        onClose={() => setCancelConfirmVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-4">
            <Feather name="alert-triangle" size={28} color="#F59E0B" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Cancel AutoReinvest Plan?
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            This will permanently cancel your AutoReinvest plan. You can always
            create a new plan later.
          </Text>
          <TouchableOpacity
            onPress={confirmCancel}
            className="bg-red-600 rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Yes, Cancel Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCancelConfirmVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Keep Plan</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Cancel Success Bottom Sheet */}
      <BottomSheet
        visible={cancelSuccessVisible}
        onClose={() => setCancelSuccessVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="check-circle" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Plan Cancelled
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Your AutoReinvest plan has been successfully cancelled. You can
            create a new plan anytime.
          </Text>
          <TouchableOpacity
            onPress={handleCancelSuccessOk}
            className="bg-green-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default ManageAutoReinvest;
