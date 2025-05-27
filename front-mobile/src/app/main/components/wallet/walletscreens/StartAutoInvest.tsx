import React, { useState, useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import TopBar from "../../profileScreens/components/ui/TopBar";
import AmountSetup from "../compoenets/ui/setupAmount";
import ThemeSetup from "../compoenets/ui/ThemeSetup";
import { ThemeKey } from "../compoenets/ui/ThemeCard";

const GREEN = "#10B981";

const StartAutoInvest: React.FC = () => {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const titles = { 1: "Enter amount", 2: "Select a theme" } as const;
  const handleBack = () => (step === 1 ? router.back() : setStep(1));

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Top bar */}
      <TopBar
        title={titles[step]}
        onBackPress={handleBack}
        noMargin={true}
        rightComponent={
          step === 2 ? (
            <Feather name="message-circle" size={22} color={GREEN} />
          ) : null
        }
      />

      {/* Progress bar */}
      <View style={{ height: 6, backgroundColor: "#E5E7EB" }}>
        <Animated.View
          style={{
            height: "100%",
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: GREEN,
          }}
        />
      </View>

      {/* Body: center AmountSetup, flush ThemeSetup */}
      <View
        style={{
          flex: 1,
          justifyContent: step === 1 ? "center" : "flex-start",
        }}
      >
        {step === 1 ? (
          <AmountSetup onNext={() => setStep(2)} />
        ) : (
          <ThemeSetup
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
          />
        )}
      </View>
    </View>
  );
};

export default StartAutoInvest;
