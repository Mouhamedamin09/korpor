import * as LocalAuthentication from "expo-local-authentication";
import { Alert } from "react-native";

export const handleBiometricAuth = async (): Promise<{ success: boolean }> => {
  try {
    // 1. Check for hardware
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert(
        "Unsupported",
        "Biometric hardware not available on this device."
      );
      return { success: false };
    }

    // 2. Check if enrolled
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert(
        "Unavailable",
        "No biometrics enrolled. Please set up Face or Fingerprint."
      );
      return { success: false };
    }

    // 3. Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
      fallbackLabel: "Use Passcode",
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }

    // Optional: Handle specific errors
    let message = "Authentication failed.";
    switch (result.error) {
      case "user_cancel":
      case "app_cancel":
        message = "Authentication was canceled.";
        break;
      case "lockout":
        message = "Too many failed attempts. Try again later.";
        break;
    }

    Alert.alert("Failed", message);
    return { success: false };
  } catch (error) {
    console.error("Biometric Auth Error:", error);
    Alert.alert("Error", "Something went wrong with biometric authentication.");
    return { success: false };
  }
};
