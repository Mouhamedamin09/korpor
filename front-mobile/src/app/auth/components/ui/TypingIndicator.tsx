import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (dot: Animated.Value, delay: number) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ])
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View className="flex-row items-center space-x-1">
      <Animated.View
        style={{ opacity: dot1 }}
        className="w-2 h-2 bg-[#A0AEC0] rounded-full"
      />
      <Animated.View
        style={{ opacity: dot2 }}
        className="w-2 h-2 bg-[#A0AEC0] rounded-full"
      />
      <Animated.View
        style={{ opacity: dot3 }}
        className="w-2 h-2 bg-[#A0AEC0] rounded-full"
      />
    </View>
  );
}
