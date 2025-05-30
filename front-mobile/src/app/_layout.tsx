import { Stack } from "expo-router";
import { ThemeProvider } from "@shared/providers/themeProvider";
import { FontProvider } from "@shared/providers/fontProvider";
// Import global CSS for NativeWind
import "../../global.css";

export default function RootLayout() {
  return (
    <FontProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
        </Stack>
      </ThemeProvider>
    </FontProvider>
  );
}
