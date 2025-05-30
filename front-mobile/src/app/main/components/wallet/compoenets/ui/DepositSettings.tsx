/* ────────────────────────────────────────────────────────────────────────────
   Step-3 — set up recurring deposits
   • Adds onNext(data) callback so the wizard can advance to ConfirmAutoInvest
──────────────────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import { fetchAccountData, AccountData } from "@main/services/api";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const PressableRow: React.FC<{
  onPress?: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) =>
  onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} className="mb-3">
      {children}
    </TouchableOpacity>
  ) : (
    <View className="mb-3">{children}</View>
  );

type VerificationProgress = { completed: number; total: number };
interface ExtendedAccountData extends AccountData {
  verificationProgress?: VerificationProgress;
}

const suffix = (d: number) =>
  d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th";

const formatDate = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric" });

const formatDateFull = (date: Date) =>
  date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ------------------------------------------------------------------ */
/*  Types / Props                                                     */
/* ------------------------------------------------------------------ */

export type DepositData = {
  startDate: string; // e.g. "15 Jun 2025"
  depositDay: number; // e.g. 15 (the day of the month)
  frequency: string; // e.g. "Monthly"
  paymentMethod: string; // e.g. "Visa •••• 1234"
  verification: "Verified" | "Pending";
};

interface Props {
  /** Optional existing deposit data (for editing) */
  deposit?: DepositData | null;
  /** Called once the user taps "Continue" */
  onNext: (data: DepositData) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const DepositSettings: React.FC<Props> = ({ onNext, deposit }) => {
  const router = useRouter();

  /* ───────── Today helpers ───────── */
  const today = useMemo(() => new Date(), []);
  const todayDay = today.getDate();

  /* ───────── Deposit-day picker ───────── */
  const [selectedDay, setSelectedDay] = useState<number>(
    deposit ? parseInt(deposit.startDate) : 27
  );
  const [tempDay, setTempDay] = useState<number>(selectedDay);
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  /* ───────── "Start today" toggle ───────── */
  const [startToday, setStartToday] = useState<boolean>(
    selectedDay === todayDay
  );
  useEffect(() => {
    if (selectedDay === todayDay) setStartToday(true);
  }, [selectedDay, todayDay]);

  /* ───────── Account / refresh ───────── */
  const [account, setAccount] = useState<ExtendedAccountData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchAccountData().then(setAccount).catch(console.error);
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAccountData()
      .then(setAccount)
      .catch(console.error)
      .finally(() => setIsRefreshing(false));
  };

  /* ───────── Derived schedule text ───────── */
  const scheduleText = useMemo(() => {
    if (selectedDay === todayDay) {
      return `Recurring deposits start today and will recur on the ${selectedDay}${suffix(
        selectedDay
      )} of every month.`;
    }
    const nextDeposit = new Date(today);
    if (todayDay >= selectedDay)
      nextDeposit.setMonth(nextDeposit.getMonth() + 1);
    nextDeposit.setDate(selectedDay);
    const periodEnd = new Date(nextDeposit);
    periodEnd.setDate(periodEnd.getDate() - 1);
    if (startToday) {
      return `Your first deposit will be today and your AutoInvest period will run from ${formatDate(
        today
      )} – ${formatDate(periodEnd)}, recurring again on ${formatDate(
        nextDeposit
      )}.`;
    }
    return `Your AutoInvestment will start on ${formatDate(nextDeposit)}.`;
  }, [selectedDay, startToday, today, todayDay]);

  /* ───────── Verification progress ───────── */
  const completed = account?.verificationProgress?.completed ?? 4;
  const total = account?.verificationProgress?.total ?? 4;

  /* ───────── Helper to build DepositData ───────── */
  const buildDepositData = (): DepositData => {
    const start = new Date(today);
    if (!startToday) {
      if (todayDay >= selectedDay) start.setMonth(start.getMonth() + 1);
      start.setDate(selectedDay);
    }
    const startDate = formatDateFull(start);
    return {
      startDate,
      depositDay: selectedDay,
      frequency: "Monthly",
      paymentMethod: "Visa •••• 1234", // replace with real method when chosen
      verification: completed === total ? "Verified" : "Pending",
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* ───────── Heading ───────── */}
        <View className="px-4">
          <Text className="text-2xl leading-8 font-bold text-[#0A0E23] mb-3">
            Choose your recurring deposit settings
          </Text>
          <Text className="text-lg leading-6 text-[#4B5563]">
            Funds will be deposited to your wallet each month on the date you
            set and invested throughout the month as new properties are added.
          </Text>
        </View>

        {/* ───────── Deposit-settings card ───────── */}
        <View className="mx-4 mt-6 rounded-3xl bg-white shadow-lg overflow-hidden">
          {/* ▸ Deposit with */}
          <View className="px-5 pt-5">
            <Text className="font-semibold text-[#0A0E23] mb-3">
              Deposit with
            </Text>
            <TouchableOpacity className="bg-[#000] rounded-2xl py-4 flex-row items-center justify-center active:opacity-80">
              <Feather name="plus" size={18} color="#fff" />
              <Text className="ml-2 text-base font-semibold text-white">
                Add payment method
              </Text>
            </TouchableOpacity>
          </View>

          {/* divider */}
          <View className="h-px bg-[#E5E7EB] my-5 mx-5" />

          {/* ▸ Recurring day */}
          <View className="px-5">
            <Text className="font-semibold text-[#0A0E23] mb-3">
              Recurring deposit day
            </Text>
            <TouchableOpacity
              onPress={() => {
                setTempDay(selectedDay);
                setPickerVisible(true);
              }}
              className="border border-[#E5E7EB] rounded-2xl flex-row items-center justify-between py-3 px-4 active:opacity-80"
            >
              <Text className="text-[#0A0E23]">
                Every {selectedDay}
                {suffix(selectedDay)} of the month
              </Text>
              <Feather name="calendar" size={18} color="#0A0E23" />
            </TouchableOpacity>
          </View>

          {/* divider */}
          <View className="h-px bg-[#E5E7EB] my-5 mx-5" />

          {/* ▸ Start today */}
          <View className="px-5 pb-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-[#000]">Start today</Text>
              <Switch
                value={startToday}
                disabled={selectedDay === todayDay}
                onValueChange={(v) =>
                  selectedDay !== todayDay && setStartToday(v)
                }
                trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
                thumbColor="#10B981"
              />
            </View>

            <View className="mt-3 flex-row">
              <View className="w-1.5 bg-[#10B981] rounded-full mr-3" />
              <Text className="flex-1 text-xs leading-5 text-[#6B7280]">
                {scheduleText}
              </Text>
            </View>
          </View>
        </View>

        {/* ───────── KYC progress / Continue ───────── */}
        {completed < total ? (
          <PressableRow
            onPress={() =>
              router.push(
                "/main/components/profileScreens/profile/CompleteAccountSetupScreen"
              )
            }
          >
            <View className="mx-4 mt-5 flex-row items-center rounded-3xl bg-white shadow-lg border border-[#E5E7EB] p-4">
              {/* icon bubble */}
              <View className="w-12 h-12 rounded-full bg-[#10B981]/10 items-center justify-center mr-4">
                <Feather name="shield" size={20} color="#000" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-[#0A0E23] mb-1">
                  Verify your account to start investing
                </Text>

                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${(completed / total) * 100}%` }}
                    className="h-full bg-[#10B981]"
                  />
                </View>

                <Text className="text-xs text-[#6B7280] mt-1">
                  {`${completed} of ${total} steps completed`}
                </Text>
              </View>

              <Feather name="chevron-right" size={24} color="#9CA3AF" />
            </View>
          </PressableRow>
        ) : (
          <View className="mx-4 mt-5">
            <TouchableOpacity
              onPress={() => onNext(buildDepositData())}
              className="bg-primary rounded-2xl py-4 items-center shadow-sm"
            >
              <Text className="text-primaryText font-semibold text-base">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ───────── Grid day-picker modal ───────── */}
      <Modal
        transparent
        visible={pickerVisible}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View className="bg-white rounded-t-3xl p-4 max-h-[50%]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text className="text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Select Day</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDay(tempDay);
                  setPickerVisible(false);
                }}
              >
                <Text className="text-base font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            {/* Grid of days */}
            <FlatList
              data={days}
              keyExtractor={(d) => d.toString()}
              numColumns={6}
              contentContainerStyle={{ alignItems: "center" }}
              renderItem={({ item: day }) => {
                const isActive = day === tempDay;
                return (
                  <TouchableOpacity
                    onPress={() => setTempDay(day)}
                    className={`m-1 w-10 h-10 rounded-full items-center justify-center ${
                      isActive ? "bg-[#10B981]" : "bg-[#F3F4F6]"
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        isActive ? "text-white" : "text-[#374151]"
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DepositSettings;
