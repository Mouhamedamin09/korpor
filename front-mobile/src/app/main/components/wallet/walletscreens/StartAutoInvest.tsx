// screens/main/components/wallet/StartAutoInvest.tsx
/* --------------------------------------------------------------------------   🔹  StartAutoInvest — 4-step wizard   -------------------------------------------------------------------------- */
import React, { useState, useRef, useEffect } from "react";
import { View, Animated, TouchableOpacity, Text, Alert } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import TopBar from "../../profileScreens/components/ui/TopBar";
import { BottomSheet } from "@main/components/profileScreens/components/ui";
import AmountSetupSelect from "../compoenets/ui/AmountSetupSelect";
import ThemeSetupSelect from "../compoenets/ui/ThemeSetupSelect";
import DepositSettings, { DepositData } from "../compoenets/ui/DepositSettings";
import ConfirmAutoInvest from "../compoenets/ui/ConfirmAutoInvest";
import { ThemeKey } from "../compoenets/ui/ThemeCard";
import { createAutoInvestPlan } from "../../../services/autoInvest";

const GREEN = "#10B981";

export default function StartAutoInvest() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    step?: string;
    theme?: ThemeKey;
    amount?: string;
  }>();

  /* ---------- wizard state ---------- */
  const initialStep = params.step ? (Number(params.step) as 1 | 2 | 3 | 4) : 1;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);

  // Initialize amount from URL params if available, otherwise use default
  const initialAmount = params.amount ? Number(params.amount) : 2000;
  const [amount, setAmount] = useState<number>(initialAmount);
  const amountRef = useRef<number>(initialAmount);
  const [confirmAmount, setConfirmAmount] = useState<number>(initialAmount);

  // Debug logging for URL params
  useEffect(() => {
    console.log("StartAutoInvest: URL params:", params);
    console.log("StartAutoInvest: Initial amount from params:", initialAmount);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    amountRef.current = amount;
    setConfirmAmount(amount);
    console.log("Amount ref updated to:", amountRef.current);
    console.log("Confirm amount updated to:", amount);
  }, [amount]);

  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(
    params.theme || null
  );
  const [deposit, setDeposit] = useState<DepositData | null>(null);

  /* ---------- progress bar ---------- */
  const progressAnim = useRef(new Animated.Value(initialStep)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  /* ---------- help bottom-sheet ---------- */
  const [helpSheetVisible, setHelpSheetVisible] = useState(false);
  const openHelpSheet = () => setHelpSheetVisible(true);
  const closeHelpSheet = () => setHelpSheetVisible(false);

  const titles = {
    1: "Enter amount",
    2: "Select a theme",
    3: "Deposit settings",
    4: "Confirm & launch",
  } as const;

  const handleBack = () => {
    if (step === 1) return router.back();
    setStep((s) => (s === 4 ? 3 : s === 3 ? 2 : 1));
  };

  /* ---------- handlers for each stage ---------- */
  const handleAmountNext = () => {
    if (amount > 0) {
      console.log("Passed amount is :", amount);
      setStep(2);
    }
  };

  const handleThemeNext = (t: ThemeKey) => {
    if (helpSheetVisible) closeHelpSheet();
    setSelectedTheme(t);
    setStep(3);
  };

  const handleDepositNext = (d: DepositData) => {
    setDeposit(d);
    setStep(4);
  };

  const handleLaunch = async () => {
    try {
      if (!selectedTheme || !deposit) {
        console.error("Missing required data for AutoInvest plan");
        Alert.alert(
          "Error",
          "Missing required data. Please go back and complete all steps."
        );
        return;
      }

      console.log("Debug - deposit data:", deposit);
      console.log("Debug - selectedTheme:", selectedTheme);
      console.log("Debug - amount:", amount);

      // Use the depositDay directly from the deposit data
      const depositDay = deposit.depositDay;

      console.log("Debug - depositDay:", depositDay);

      const themeMapping: Record<
        ThemeKey,
        "growth" | "income" | "index" | "balanced"
      > = {
        growth: "growth",
        income: "income",
        diversified: "balanced",
      };

      const mappedTheme = themeMapping[selectedTheme];
      console.log("Debug - mappedTheme:", mappedTheme);

      // Validate all required fields before making the API call
      if (!amount || amount <= 0) {
        Alert.alert("Error", "Please enter a valid monthly amount.");
        return;
      }

      if (!mappedTheme) {
        Alert.alert("Error", "Please select a valid investment theme.");
        return;
      }

      if (!depositDay || depositDay < 1 || depositDay > 31) {
        Alert.alert("Error", "Please select a valid deposit day.");
        return;
      }

      const autoInvestData = {
        monthlyAmount: amount,
        theme: mappedTheme,
        depositDay,
        paymentMethodId: deposit.paymentMethod || "default",
        riskLevel: "medium" as const,
        notes: `AutoInvest plan created on ${new Date().toISOString()}`,
      };

      console.log("Debug - final autoInvestData:", autoInvestData);

      await createAutoInvestPlan(autoInvestData);

      Alert.alert(
        "Success!",
        "Your AutoInvest plan has been created successfully. Your first deposit will be processed on your selected date.",
        [
          {
            text: "Got it",
            onPress: () =>
              router.replace(
                "/main/components/wallet/walletscreens/AutoInvestScreen"
              ),
          },
        ]
      );
    } catch (error) {
      console.error("Error in handleLaunch:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create AutoInvest plan. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Debug logging to track amount changes
  useEffect(() => {
    console.log("StartAutoInvest: Amount changed to:", amount);
  }, [amount]);

  // Debug logging to track step changes
  useEffect(() => {
    console.log(
      "StartAutoInvest: Step changed to:",
      step,
      "with amount:",
      amount
    );
  }, [step]);

  // Debug logging to track deposit data
  useEffect(() => {
    console.log("StartAutoInvest: Deposit data changed:", deposit);
  }, [deposit]);

  /* ---------- render ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <TopBar
          title={titles[step]}
          onBackPress={handleBack}
          noMargin
          rightComponent={
            step === 2 ? (
              <TouchableOpacity onPress={openHelpSheet}>
                <Feather name="message-circle" size={22} color={GREEN} />
              </TouchableOpacity>
            ) : null
          }
        />

        {/* progress bar */}
        <View style={{ height: 6, backgroundColor: "#E5E7EB" }}>
          <Animated.View
            style={{
              height: "100%",
              width: progressAnim.interpolate({
                inputRange: [1, 2, 3, 4],
                outputRange: ["25%", "50%", "75%", "100%"],
              }),
              backgroundColor: GREEN,
            }}
          />
        </View>
      </SafeAreaView>

      {/* body */}
      <View
        style={{
          flex: 1,
          justifyContent: step === 1 ? "center" : "flex-start",
        }}
      >
        {step === 1 && (
          <View className="flex-1">
            <AmountSetupSelect amount={amount} setAmount={setAmount} />
            <TouchableOpacity
              className="mx-4 mb-6 bg-black py-4 rounded-lg items-center"
              onPress={handleAmountNext}
            >
              <Text className="text-base font-bold text-white">
                Select your theme
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <ThemeSetupSelect
              selectedTheme={selectedTheme}
              onSelectTheme={handleThemeNext}
              amount={amount}
            />
          </View>
        )}

        {step === 3 && (
          <DepositSettings deposit={deposit} onNext={handleDepositNext} />
        )}

        {step === 4 && (
          <>
            {/* Debug logging right before rendering ConfirmAutoInvest */}
            {(() => {
              console.log(
                "About to render ConfirmAutoInvest with amount:",
                amount
              );
              console.log("Confirm amount value:", confirmAmount);
              console.log("Amount ref value:", amountRef.current);
              console.log("Step 4 - Current state:", {
                amount,
                confirmAmount,
                selectedTheme,
                deposit,
              });
              return null;
            })()}
            <ConfirmAutoInvest
              key={`confirm-${amount}-${step}`}
              amount={confirmAmount}
              theme={selectedTheme as ThemeKey}
              deposit={
                deposit || {
                  startDate: "",
                  depositDay: 1,
                  frequency: "",
                  paymentMethod: "",
                  verification: "Pending",
                }
              }
              onBack={() => setStep(3)}
              onLaunch={handleLaunch}
            />
          </>
        )}
      </View>

      {/* help bottom-sheet */}
      <BottomSheet visible={helpSheetVisible} onClose={closeHelpSheet}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-inputBg items-center justify-center mb-4">
            <Feather name="message-circle" size={28} color="#000" />
          </View>
          <Text className="text-xl font-semibold text-surfaceText text-center mb-2">
            Need help with AutoInvest?
          </Text>
          <Text className="text-sm text-mutedText text-center mb-6">
            Our team can guide you through setting up your AutoInvest plan and
            answer any questions you may have.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => console.log("Get in touch clicked")}
          className="bg-primary rounded-lg p-4 items-center mb-4 flex-row justify-center"
        >
          <Text className="text-primaryText font-medium text-base mr-2">
            Get in touch
          </Text>
          <Feather name="message-circle" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={closeHelpSheet}
          className="rounded-lg p-4 items-center border border-border"
        >
          <Text className="text-text font-medium text-base">Cancel</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}
