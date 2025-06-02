/* -------------------------------------------------------------------------- */
/*  Parent screen: fade transitions, opacity dots, stable nav                */
/* -------------------------------------------------------------------------- */
import React, { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import pages from "@auth/data/onboardingPages";
import OnboardingContent from "@auth/components/complex/OnboardingContent";

export default function Onboarding() {
  const router = useRouter();

  /* page index & anim refs */
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dotAnimations = useRef(
    pages.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.4))
  ).current;

  /* navigate out */
  const goToApp = () => router.replace("/main/screens/(tabs)/properties");

  /* next / back logic with fade */
  const transition = (nextIndex: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(nextIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentPage === pages.length - 1) {
      goToApp();
    } else {
      transition(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) transition(currentPage - 1);
  };

  const handleSkip = () => goToApp();

  /* update dot opacities */
  useEffect(() => {
    dotAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: currentPage === i ? 1 : 0.4,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [currentPage]);

  return (
    <OnboardingContent
      currentPage={currentPage}
      pages={pages}
      fadeAnim={fadeAnim}
      dotAnimations={dotAnimations}
      handleNext={handleNext}
      handleBack={handleBack}
      handleSkip={handleSkip}
    />
  );
}
