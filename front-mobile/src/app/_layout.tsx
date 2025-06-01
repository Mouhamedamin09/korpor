import { Stack } from "expo-router";
import { ThemeProvider } from "@shared/providers/themeProvider";
import { FontProvider } from "@shared/providers/fontProvider";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_CONFIG } from "@main/components/wallet/config/stripe";
// Import global CSS for NativeWind
import "../../global.css";

export default function RootLayout() {
  return (
    <FontProvider>
      <ThemeProvider>
        <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Home" }} />
          </Stack>
        </StripeProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
