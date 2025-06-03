import { useFonts } from "expo-font";
import { View, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    // Poppins font family - perfect for real estate apps
    "Poppins-Thin": require("../../assets/fonts/poppins/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("../../assets/fonts/poppins/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../../assets/fonts/poppins/Poppins-Light.ttf"),
    "Poppins-Regular": require("../../assets/fonts/poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/poppins/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/poppins/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../../assets/fonts/poppins/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("../../assets/fonts/poppins/Poppins-Black.ttf"),

    // Italic variants for emphasis
    "Poppins-ThinItalic": require("../../assets/fonts/poppins/Poppins-ThinItalic.ttf"),
    "Poppins-ExtraLightItalic": require("../../assets/fonts/poppins/Poppins-ExtraLightItalic.ttf"),
    "Poppins-LightItalic": require("../../assets/fonts/poppins/Poppins-LightItalic.ttf"),
    "Poppins-Italic": require("../../assets/fonts/poppins/Poppins-Italic.ttf"),
    "Poppins-MediumItalic": require("../../assets/fonts/poppins/Poppins-MediumItalic.ttf"),
    "Poppins-SemiBoldItalic": require("../../assets/fonts/poppins/Poppins-SemiBoldItalic.ttf"),
    "Poppins-BoldItalic": require("../../assets/fonts/poppins/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBoldItalic": require("../../assets/fonts/poppins/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-BlackItalic": require("../../assets/fonts/poppins/Poppins-BlackItalic.ttf"),

    // Keep Arial Rounded for special accents if needed
    ArialRoundedBold: require("../../assets/fonts/arialroundedmtbold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    console.error("Error loading fonts:", fontError);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading fonts</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {children}
    </View>
  );
}
