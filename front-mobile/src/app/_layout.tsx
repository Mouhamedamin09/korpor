import { Stack } from "expo-router";
import { ThemeProvider } from "@shared/providers/themeProvider";
export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
      </Stack>
    </ThemeProvider>
  );
}
