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
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import {
  AutoInvestPlan,
  AutoInvestStats,
  fetchAutoInvestPlan,
  fetchAutoInvestStats,
  toggleAutoInvestPlan,
  cancelAutoInvestPlan,
} from "../../../services/autoInvest";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <View
      className={`px-2 py-1 rounded-full ${colors[status] || colors.active}`}
    >
      <Text
        className={`text-xs font-medium capitalize ${
          colors[status]?.includes("green")
            ? "text-green-800"
            : colors[status]?.includes("yellow")
            ? "text-yellow-800"
            : "text-red-800"
        }`}
      >
        {status}
      </Text>
    </View>
  );
};

const ActivePlanCard = ({
  plan,
  stats,
  onToggle,
  onCancel,
}: {
  plan: AutoInvestPlan;
  stats: AutoInvestStats;
  onToggle: (action: "pause" | "resume") => void;
  onCancel: () => void;
}) => {
  const nextDepositDate = plan.nextDepositDate
    ? new Date(plan.nextDepositDate).toLocaleDateString()
    : "N/A";

  return (
    <Card extraStyle="p-6 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          {plan.theme.charAt(0).toUpperCase() + plan.theme.slice(1)} Theme
        </Text>
        <StatusBadge status={plan.status} />
      </View>

      {/* Monthly amount */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          {plan.currency} {plan.monthlyAmount.toLocaleString()}
        </Text>
        <Text className="text-sm text-gray-500">Monthly investment</Text>
      </View>

      {/* Totals */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Total Deposited</Text>
          <Text className="text-base font-semibold text-gray-900">
            {plan.currency} {plan.totalDeposited.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Total Invested</Text>
          <Text className="text-base font-semibold text-gray-900">
            {plan.currency} {plan.totalInvested.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Returns & Next Deposit */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Returns</Text>
          <Text className="text-base font-semibold text-green-600">
            +{plan.currency} {(stats.totalReturns || 0).toLocaleString()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Next Deposit</Text>
          <Text className="text-base font-semibold text-gray-900">
            {nextDepositDate}
          </Text>
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
    </Card>
  );
};

const ManageAutoInvest: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plan, setPlan] = useState<AutoInvestPlan | null>(null);
  const [stats, setStats] = useState<AutoInvestStats | null>(null);
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

      const [planData, statsData] = await Promise.all([
        fetchAutoInvestPlan(),
        fetchAutoInvestStats(),
      ]);

      setPlan(planData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading AutoInvest data:", err);
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
      await toggleAutoInvestPlan(action);
      setSuccessMessage(`AutoInvest plan ${action}d successfully`);
      setSuccessSheetVisible(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to ${action} plan`;
      setErrorMessage(msg);
      setErrorSheetVisible(true);
    }
  };

  const handleCancel = () => {
    setCancelConfirmVisible(true);
  };

  const confirmCancel = async () => {
    try {
      setCancelConfirmVisible(false);
      await cancelAutoInvestPlan();
      setCancelSuccessVisible(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel plan";
      setErrorMessage(msg);
      setErrorSheetVisible(true);
    }
  };

  const handleSuccessOk = () => {
    setSuccessSheetVisible(false);
    loadData();
  };

  const handleCancelSuccessOk = () => {
    setCancelSuccessVisible(false);
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Manage AutoInvest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Manage AutoInvest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
          />
        }
      >
        {error && (
          <Card extraStyle="p-4 mb-4 bg-red-50 border border-red-200">
            <Text className="text-red-800 text-center">{error}</Text>
          </Card>
        )}

        {plan && stats ? (
          <>
            <ActivePlanCard
              plan={plan}
              stats={stats}
              onToggle={handleToggle}
              onCancel={handleCancel}
            />

            {/* Create New Plan Section */}
            <Card extraStyle="p-6 mt-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Feather name="plus" size={20} color="#10B981" />
                </View>
                <Text className="text-lg font-semibold text-gray-900">
                  Want to create another plan?
                </Text>
              </View>

              <Text className="text-gray-500 mb-4">
                You can create multiple AutoInvest plans with different themes
                and amounts to diversify your investment strategy.
              </Text>

              <TouchableOpacity
                className="bg-[#000000] rounded-2xl py-4 active:opacity-80 flex-row items-center justify-center"
                onPress={() =>
                  router.push(
                    "/main/components/wallet/walletscreens/StartAutoInvest"
                  )
                }
                activeOpacity={0.8}
              >
                <Feather
                  name="plus"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-semibold text-center">
                  Create New AutoInvest Plan
                </Text>
              </TouchableOpacity>
            </Card>
          </>
        ) : (
          <Card extraStyle="p-6 text-center">
            <Feather
              name="info"
              size={48}
              color="#6B7280"
              style={{ alignSelf: "center", marginBottom: 16 }}
            />
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No AutoInvest Plan
            </Text>
            <Text className="text-gray-500 mb-6">
              You don't have an active AutoInvest plan. Create one to start
              automated investing.
            </Text>
            <TouchableOpacity
              className="bg-green-600 py-3 px-6 rounded-lg"
              onPress={() =>
                router.push(
                  "/main/components/wallet/walletscreens/StartAutoInvest"
                )
              }
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center">
                Create AutoInvest Plan
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {stats && (
          <Card extraStyle="p-6 mt-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Performance Overview
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Months Active</Text>
                <Text className="font-semibold text-gray-900">
                  {stats.monthsActive}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Avg. Monthly Return</Text>
                <Text className="font-semibold text-green-600">
                  +{stats.averageMonthlyReturn.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Projected Annual Return</Text>
                <Text className="font-semibold text-green-600">
                  +{stats.projectedAnnualReturn.toLocaleString()}
                </Text>
              </View>
            </View>
          </Card>
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
            Success
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {successMessage}
          </Text>
          <TouchableOpacity
            onPress={handleSuccessOk}
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

      {/* Cancel Confirmation Bottom Sheet */}
      <BottomSheet
        visible={cancelConfirmVisible}
        onClose={() => setCancelConfirmVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-triangle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Cancel AutoInvest Plan
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to cancel your AutoInvest plan? This action
            cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={confirmCancel}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Cancel Plan</Text>
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
          <Text className="text-sm text-gray-600 text-center mb-6">
            Your AutoInvest plan has been cancelled successfully.
          </Text>
          <TouchableOpacity
            onPress={handleCancelSuccessOk}
            className="bg-green-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default ManageAutoInvest;
