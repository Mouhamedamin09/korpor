import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

const PaginationDot = ({ active }: { active: boolean }) => {
  const activeValue = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    activeValue.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active]);

  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(activeValue.value, [0, 1], [6, 7]),
    height: interpolate(activeValue.value, [0, 1], [6, 7]),
    borderRadius: 6,
    marginHorizontal: 3,
    backgroundColor: active ? "white" : "black",
    opacity: interpolate(activeValue.value, [0, 1], [0.6, 1]),
  }));

  return <Animated.View style={dotStyle} />;
};

export default PaginationDot;
