import { Stack } from "expo-router";
import { ThemeProvider } from "@shared/providers/themeProvider";
import { FontProvider } from "@shared/providers/fontProvider";

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
