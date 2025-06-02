/* --------------------------------------------------------------------------   
🔹  StartAutoReinvest — 4-step wizard for setting up auto-reinvestment plans
-------------------------------------------------------------------------- */
import React, { useState, useRef, useEffect } from "react";
import { View, Animated, TouchableOpacity, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import TopBar from "../../profileScreens/components/ui/TopBar";
import { BottomSheet } from "@main/components/profileScreens/components/ui";
import ReinvestAmountSetup from "../compoenets/ui/ReinvestAmountSetup";
import ReinvestThemeSelect from "../compoenets/ui/ReinvestThemeSelect";
import ReinvestSettings, {
  ReinvestData,
} from "../compoenets/ui/ReinvestSettings";
import ConfirmAutoReinvest from "../compoenets/ui/ConfirmAutoReinvest";
import { ThemeKey } from "../compoenets/ui/ThemeCard";
import { createAutoReinvest } from "../../../services/autoReinvest";

const GREEN = "#10B981";

export default function StartAutoReinvest() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    step?: string;
    theme?: ThemeKey;
    percentage?: string;
  }>();

  /* ---------- wizard state ---------- */
  const initialStep = params.step ? (Number(params.step) as 1 | 2 | 3 | 4) : 1;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);

  // Initialize percentage from URL params if available, otherwise use default
  const initialPercentage = params.percentage ? Number(params.percentage) : 75;
  const [reinvestPercentage, setReinvestPercentage] =
    useState<number>(initialPercentage);
  const percentageRef = useRef<number>(initialPercentage);
  const [confirmPercentage, setConfirmPercentage] =
    useState<number>(initialPercentage);

  // Debug logging for URL params
  useEffect(() => {
    console.log("StartAutoReinvest: URL params:", params);
    console.log(
      "StartAutoReinvest: Initial percentage from params:",
      initialPercentage
    );
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    percentageRef.current = reinvestPercentage;
    setConfirmPercentage(reinvestPercentage);
    console.log("Percentage ref updated to:", percentageRef.current);
    console.log("Confirm percentage updated to:", reinvestPercentage);
  }, [reinvestPercentage]);

  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(
    params.theme || null
  );
  const [reinvestSettings, setReinvestSettings] = useState<ReinvestData | null>(
    null
  );

  // Auto-advance to step 3 if we have both percentage and theme (coming from ThemeDetails)
  useEffect(() => {
    if (params.step === "3" && params.theme && params.percentage) {
      console.log("Auto-advancing to step 3 with theme:", params.theme);
      setSelectedTheme(params.theme);
      setReinvestPercentage(Number(params.percentage));
      setStep(3);
    }
  }, [params.step, params.theme, params.percentage]);

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
  const [successSheetVisible, setSuccessSheetVisible] = useState(false);
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openHelpSheet = () => setHelpSheetVisible(true);
  const closeHelpSheet = () => setHelpSheetVisible(false);

  const titles = {
    1: "Set reinvest percentage",
    2: "Select investment theme",
    3: "Reinvestment settings",
    4: "Confirm & activate",
  } as const;

  const handleBack = () => {
    if (step === 1) return router.back();
    setStep((s) => (s === 4 ? 3 : s === 3 ? 2 : 1));
  };

  /* ---------- handlers for each stage ---------- */
  const handlePercentageNext = () => {
    if (reinvestPercentage > 0 && reinvestPercentage <= 100) {
      console.log("Passed percentage is:", reinvestPercentage);
      setStep(2);
    }
  };

  const handleThemeNext = (t: ThemeKey) => {
    if (helpSheetVisible) closeHelpSheet();
    setSelectedTheme(t);
    setStep(3);
  };

  const handleSettingsNext = (settings: ReinvestData) => {
    setReinvestSettings(settings);
    setStep(4);
  };

  const handleLaunch = async () => {
    try {
      if (!selectedTheme || !reinvestSettings) {
        console.error("Missing required data for AutoReinvest plan");
        setErrorMessage(
          "Missing required data. Please go back and complete all steps."
        );
        setErrorSheetVisible(true);
        return;
      }

      console.log("Debug - reinvest settings:", reinvestSettings);
      console.log("Debug - selectedTheme:", selectedTheme);
      console.log("Debug - percentage:", reinvestPercentage);

      const themeMapping: Record<
        ThemeKey,
        "growth" | "income" | "index" | "balanced" | "diversified"
      > = {
        growth: "growth",
        income: "income",
        diversified: "diversified",
      };

      const mappedTheme = themeMapping[selectedTheme];
      console.log("Debug - mappedTheme:", mappedTheme);

      // Validate all required fields before making the API call
      if (
        !reinvestPercentage ||
        reinvestPercentage <= 0 ||
        reinvestPercentage > 100
      ) {
        setErrorMessage(
          "Please enter a valid reinvestment percentage (1-100%)."
        );
        setErrorSheetVisible(true);
        return;
      }

      if (!mappedTheme) {
        setErrorMessage("Please select a valid investment theme.");
        setErrorSheetVisible(true);
        return;
      }

      const autoReinvestData = {
        minimumReinvestAmount: reinvestSettings.minimumAmount || 100,
        reinvestPercentage: reinvestPercentage,
        theme: mappedTheme,
        riskLevel: reinvestSettings.riskLevel || "medium",
        reinvestmentFrequency: reinvestSettings.frequency || "immediate",
        autoApprovalEnabled: reinvestSettings.autoApproval || true,
        maxReinvestPercentagePerProject: reinvestSettings.maxPerProject || 25,
        preferredRegions: reinvestSettings.preferredRegions || [],
        excludedPropertyTypes: reinvestSettings.excludedPropertyTypes || [],
        notes: `AutoReinvest plan created on ${new Date().toISOString()}`,
      };

      console.log("Debug - final autoReinvestData:", autoReinvestData);

      await createAutoReinvest(autoReinvestData);

      setSuccessSheetVisible(true);
    } catch (error) {
      console.error("Error in handleLaunch:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create AutoReinvest plan. Please try again."
      );
      setErrorSheetVisible(true);
    }
  };

  const handleSuccessOk = () => {
    setSuccessSheetVisible(false);
    router.replace("/main/components/wallet/walletscreens/AutoReInvestScreen");
  };

  // Debug logging to track percentage changes
  useEffect(() => {
    console.log(
      "StartAutoReinvest: Percentage changed to:",
      reinvestPercentage
    );
  }, [reinvestPercentage]);

  // Debug logging to track step changes
  useEffect(() => {
    console.log(
      "StartAutoReinvest: Step changed to:",
      step,
      "with percentage:",
      reinvestPercentage
    );
  }, [step]);

  // Debug logging to track settings data
  useEffect(() => {
    console.log("StartAutoReinvest: Settings data changed:", reinvestSettings);
  }, [reinvestSettings]);

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
            <ReinvestAmountSetup
              percentage={reinvestPercentage}
              setPercentage={setReinvestPercentage}
            />
            <TouchableOpacity
              className="mx-4 mb-6 bg-black py-4 rounded-lg items-center"
              onPress={handlePercentageNext}
            >
              <Text className="text-base font-bold text-white">
                Select investment theme
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <ReinvestThemeSelect
              selectedTheme={selectedTheme}
              onSelectTheme={handleThemeNext}
              percentage={reinvestPercentage}
            />
          </View>
        )}

        {step === 3 && (
          <ReinvestSettings
            settings={reinvestSettings}
            onNext={handleSettingsNext}
          />
        )}

        {step === 4 && (
          <>
            {(() => {
              console.log(
                "About to render ConfirmAutoReinvest with percentage:",
                reinvestPercentage
              );
              console.log("Confirm percentage value:", confirmPercentage);
              console.log("Percentage ref value:", percentageRef.current);
              console.log("Step 4 - Current state:", {
                reinvestPercentage,
                confirmPercentage,
                selectedTheme,
                reinvestSettings,
              });
              return null;
            })()}
            <ConfirmAutoReinvest
              key={`confirm-${reinvestPercentage}-${step}`}
              percentage={confirmPercentage}
              theme={selectedTheme as ThemeKey}
              settings={
                reinvestSettings || {
                  minimumAmount: 100,
                  frequency: "immediate",
                  riskLevel: "medium",
                  autoApproval: true,
                  maxPerProject: 25,
                }
              }
              onBack={() => setStep(3)}
              onLaunch={handleLaunch}
            />
          </>
        )}
      </View>

      {/* Help Bottom Sheet */}
      <BottomSheet visible={helpSheetVisible} onClose={closeHelpSheet}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-4">
            <Feather name="help-circle" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
            Need help with AutoReinvest?
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Our team can guide you through setting up your AutoReinvest plan and
            answer any questions about reinvesting your rental income.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => console.log("Get in touch clicked")}
          className="bg-green-600 rounded-lg p-4 items-center mb-4 flex-row justify-center"
        >
          <Text className="text-white font-medium text-base mr-2">
            Get in touch
          </Text>
          <Feather name="message-circle" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={closeHelpSheet}
          className="rounded-lg p-4 items-center border border-gray-200"
        >
          <Text className="text-gray-700 font-medium text-base">Cancel</Text>
        </TouchableOpacity>
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
            AutoReinvest Activated!
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Your AutoReinvest plan has been successfully activated with{" "}
            {reinvestPercentage}% of your rental income being automatically
            reinvested.
            {"\n\n"}Your future rental payments will be processed according to
            your plan!
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
          <Text className="text-sm text-gray-600 text-center mb-6">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setErrorSheetVisible(false)}
            className="bg-red-600 rounded-lg p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
