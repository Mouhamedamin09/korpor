/* -------------------------------------------------------------------------- */
/*  OnboardingContent component: full-width image, no scale, stable layout    */
/* -------------------------------------------------------------------------- */
import React from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SolidButton } from "../ui";
import { OnboardingPage } from "@auth/data/onboardingPages";

const { width } = Dimensions.get("window");

export interface OnboardingContentProps {
  currentPage: number;
  pages: OnboardingPage[];
  fadeAnim: Animated.Value;
  dotAnimations: Animated.Value[];
  handleNext: () => void;
  handleBack: () => void;
  handleSkip: () => void;
}

export default function OnboardingContent({
  currentPage,
  pages,
  fadeAnim,
  dotAnimations,
  handleNext,
  handleBack,
  handleSkip,
}: OnboardingContentProps) {
  return (
    <LinearGradient
      colors={["#f8fafc", "#ffffff", "#f1f5f9"]}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-between pt-16 pb-8">
        {/* ── Skip (top-right) ─────────────────────────────── */}
        <View className="flex-row justify-end px-6">
          {currentPage < pages.length - 1 && (
            <Text
              className="text-gray-500 text-base font-medium"
              onPress={handleSkip}
            >
              Skip
            </Text>
          )}
        </View>

        {/* ── Central content ─────────────────────────────── */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 justify-center items-center px-8"
        >
          {/* Full-width illustration (no card) */}
          <Image
            source={pages[currentPage].image}
            style={{ width: width * 0.8, height: width * 0.8 }}
            resizeMode="contain"
          />

          {/* Title & description */}
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4 leading-tight">
            {pages[currentPage].title}
          </Text>
          <Text className="text-gray-600 text-center text-lg leading-7 max-w-sm">
            {pages[currentPage].description}
          </Text>
        </Animated.View>

        {/* ── Dots (opacity-only, no scale) ───────────────── */}
        <View className="flex-row justify-center mb-8">
          {pages.map((_, i) => (
            <Animated.View
              key={i}
              style={{
                width: 8,
                height: 8,
                marginHorizontal: 4,
                borderRadius: 4,
                backgroundColor: "#10b981",
                opacity: dotAnimations[i], // 1 for active, 0.4 for inactive
              }}
            />
          ))}
        </View>

        {/* ── Buttons (stable position) ───────────────────── */}
        <View className="px-8">
          <SolidButton
            title={pages[currentPage].buttonText}
            onPress={handleNext}
          />

          {currentPage > 0 && (
            <View className="mt-4">
              <Text
                className="text-center text-gray-500 text-base font-medium py-4"
                onPress={handleBack}
              >
                Back
              </Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
