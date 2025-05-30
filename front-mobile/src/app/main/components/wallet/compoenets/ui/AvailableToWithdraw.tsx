import React, { FC, useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

// -----------------------------------------------------------------------------
// Layout constants
// -----------------------------------------------------------------------------
const { width } = Dimensions.get("window");
const CARD_W = width - 32;
const CARD_H = 180;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------
interface AvailableToWithdrawProps {
  balance: number;
  currencySymbol?: string;
  /** Optional callback when the card is pressed */
  onPress?: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
const AvailableToWithdraw: FC<AvailableToWithdrawProps> = ({
  balance,
  currencySymbol = "$",
  onPress,
}) => {
  // Local state – mask / reveal
  const [visible, setVisible] = useState(false);
  const formattedBalance = balance.toFixed(2);
  const mask = "•".repeat(formattedBalance.length);

  // ---------------------------------------------------------------------------
  // Animations
  // ---------------------------------------------------------------------------
  const scheme = useColorScheme();
  const cardScale = useRef(new Animated.Value(1)).current;
  const toggleOpacity = useRef(new Animated.Value(0)).current; // 0 → hidden (mask)

  // Scale animation for press feedback -------------------------------------------------
  const scaleDown = () =>
    Animated.timing(cardScale, {
      toValue: 0.97,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

  const scaleUp = () =>
    Animated.timing(cardScale, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.elastic(1)),
      useNativeDriver: true,
    }).start();

  // Cross‑fade balance / mask ----------------------------------------------------------
  const animateToggle = (show: boolean) => {
    Animated.timing(toggleOpacity, {
      toValue: show ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleToggleVisibility = () => {
    const next = !visible;
    setVisible(next);
    animateToggle(next);
  };

  // Dynamic gradient in dark | light mode ---------------------------------------------
  const gradientColors =
    scheme === "dark" ? ["#004533", "#006e50"] : ["#008F6B", "#00B37D"];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        onPressIn={scaleDown}
        onPressOut={scaleUp}
        android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
        accessibilityRole="button"
        accessibilityLabel="Available balance card"
      >
        <Animated.View style={{ transform: [{ scale: cardScale }] }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Decorative glossy stripe */}
            <View style={styles.overlay1} />
            <View style={styles.overlay2} />

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                <Feather name="dollar-sign" size={20} color="#fff" />
                <Text style={styles.title}>Available to Withdraw</Text>
              </View>
              <Pressable
                onPress={handleToggleVisibility}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={visible ? "Hide balance" : "Show balance"}
              >
                <Feather
                  name={visible ? "eye-off" : "eye"}
                  size={20}
                  color="#fff"
                />
              </Pressable>
            </View>

            {/* Balance: stack two texts + cross‑fade */}
            <View style={styles.balanceWrapper}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <View style={{ position: "relative" }}>
                <Animated.Text
                  style={[styles.balanceDigits, { opacity: toggleOpacity }]}
                >
                  {formattedBalance}
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.balanceDigits,
                    {
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: toggleOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                    },
                  ]}
                >
                  {mask}
                </Animated.Text>
              </View>
            </View>

            {/* Chip graphic */}
            <View style={styles.chip} pointerEvents="none">
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.chipLine, { top: 8 + i * 7 }]} />
              ))}
              <View style={styles.chipLineVertical} />
              <View style={styles.chipMain} />
            </View>

            {/* Footer circles */}
            <View style={styles.footerRow} pointerEvents="none">
              <View style={styles.masterRow}>
                <View style={[styles.circle, styles.red]} />
                <View style={[styles.circle, styles.yellow]} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
    justifyContent: "space-between",
    // Subtle shadow – iOS & Android
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  overlay1: {
    position: "absolute",
    left: -60,
    top: -30,
    width: 280,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "-20deg" }],
  },
  overlay2: {
    position: "absolute",
    right: -80,
    bottom: -30,
    width: 280,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "-20deg" }],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  balanceWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  currencySymbol: {
    marginLeft: 50,
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginRight: 4,
  },
  balanceDigits: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  chip: {
    position: "absolute",
    top: CARD_H / 2 - 18,
    left: 20,
    width: 50,
    height: 32,
    borderRadius: 5,
    backgroundColor: "#d0b978",
    overflow: "hidden",
  },
  chipLine: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#333",
  },
  chipLineVertical: {
    position: "absolute",
    left: 25,
    width: 1,
    height: "100%",
    backgroundColor: "#333",
  },
  chipMain: {
    position: "absolute",
    top: 4,
    left: 15,
    width: 20,
    height: 24,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#333",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  masterRow: {
    flexDirection: "row",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  red: {
    backgroundColor: "#eb001b",
  },
  yellow: {
    backgroundColor: "#ffd400",
    marginLeft: -8,
    opacity: 0.8,
  },
});

export default AvailableToWithdraw;
