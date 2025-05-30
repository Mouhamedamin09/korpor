import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import ConfirmAutoInvest, {
  DepositData,
} from "../compoenets/ui/ConfirmAutoInvest";
import { ThemeKey } from "../compoenets/ui/ThemeCard";

const ConfirmAutoInvestScreen: React.FC = () => {
  const router = useRouter();
  const { amount, theme } = useLocalSearchParams<{
    amount: string;
    theme: ThemeKey;
  }>();

  // Convert amount string to number
  const numericAmount = parseFloat(amount || "0");

  // Mock deposit data (you can customize this based on your needs)
  const mockDepositData: DepositData = {
    startDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(), // Next week
    frequency: "Monthly",
    paymentMethod: "Default Payment Method",
    verification: "Pending",
  };

  const handleBack = () => {
    router.back();
  };

  const handleLaunch = () => {
    // Here you would implement the actual AutoInvest creation logic
    console.log("Launching AutoInvest with:", {
      amount: numericAmount,
      theme,
      deposit: mockDepositData,
    });

    // For now, just navigate back to the wallet or show success
    router.push("/main/components/wallet/walletscreens/ManageAutoInvest");
  };

  return (
    <ConfirmAutoInvest
      amount={numericAmount}
      theme={theme as ThemeKey}
      deposit={mockDepositData}
      onBack={handleBack}
      onLaunch={handleLaunch}
    />
  );
};

export default ConfirmAutoInvestScreen;
