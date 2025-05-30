import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";

const WalletSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoInvest, setAutoInvest] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const settingsOptions = [
    {
      id: "payment-methods",
      title: "Payment Methods",
      description: "Manage your cards and bank accounts",
      icon: "credit-card",
      onPress: () =>
        router.push(
          "/main/components/wallet/walletscreens/PaymentMethodScreen"
        ),
    },
    {
      id: "transaction-history",
      title: "Transaction History",
      description: "View all your transactions",
      icon: "list",
      onPress: () =>
        router.push(
          "/main/components/wallet/walletscreens/TransactionHistoryScreen"
        ),
    },
    {
      id: "auto-invest",
      title: "AutoInvest Settings",
      description: "Configure automatic investments",
      icon: "zap",
      onPress: () =>
        router.push("/main/components/wallet/walletscreens/AutoInvestScreen"),
    },
    {
      id: "limits",
      title: "Transaction Limits",
      description: "View and request limit changes",
      icon: "shield",
      onPress: () => handleTransactionLimits(),
    },
    {
      id: "currency",
      title: "Currency Settings",
      description: "Change your preferred currency",
      icon: "globe",
      onPress: () =>
        router.push("/main/components/profileScreens/profile/Currency"),
    },
  ];

  const handleTransactionLimits = () => {
    Alert.alert(
      "Transaction Limits",
      "Daily Deposit Limit: $10,000\nDaily Withdrawal Limit: $5,000\nMonthly Limit: $50,000\n\nTo request limit changes, please contact support.",
      [
        { text: "Contact Support", onPress: () => handleContactSupport() },
        { text: "OK", style: "cancel" },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "You can reach our support team at:\n\nEmail: support@korpor.com\nPhone: +1 (555) 123-4567\n\nSupport hours: 9 AM - 6 PM EST",
      [{ text: "OK" }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Your transaction data will be prepared and sent to your registered email address within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () =>
            Alert.alert("Success", "Export request submitted successfully"),
        },
      ]
    );
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      "Delete Wallet",
      "⚠️ This action cannot be undone. All your wallet data will be permanently deleted. Please ensure you have withdrawn all funds before proceeding.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Are you absolutely sure? This will permanently delete your wallet and all associated data.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete Forever", style: "destructive" },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Wallet Settings" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Quick Settings */}
        <View className="px-4 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Settings
          </Text>

          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <Feather name="bell" size={20} color="#374151" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Transaction Notifications
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Get notified about deposits and withdrawals
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="h-px bg-gray-200 mb-4" />

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <Feather name="zap" size={20} color="#374151" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    AutoInvest
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Automatically invest spare change
                  </Text>
                </View>
              </View>
              <Switch
                value={autoInvest}
                onValueChange={setAutoInvest}
                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="h-px bg-gray-200 mb-4" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Feather name="fingerprint" size={20} color="#374151" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Biometric Authentication
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Use fingerprint or face ID for transactions
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        {/* Settings Options */}
        <View className="px-4 mt-2">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Wallet Management
          </Text>

          {settingsOptions.map((option) => (
            <Card
              key={option.id}
              extraStyle="mb-3 p-4 bg-white rounded-2xl shadow-sm"
            >
              <TouchableOpacity
                className="flex-row items-center"
                onPress={option.onPress}
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                  <Feather
                    name={option.icon as any}
                    size={20}
                    color="#374151"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {option.description}
                  </Text>
                </View>

                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Data & Privacy */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Data & Privacy
          </Text>

          <Card extraStyle="mb-3 p-4 bg-white rounded-2xl shadow-sm">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={handleExportData}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Feather name="download" size={20} color="#3B82F6" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Export Data
                </Text>
                <Text className="text-sm text-gray-600">
                  Download your transaction history
                </Text>
              </View>

              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </Card>

          <Card extraStyle="p-4 bg-red-50 rounded-2xl border border-red-200">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={handleDeleteWallet}
            >
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                <Feather name="trash-2" size={20} color="#EF4444" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-red-900">
                  Delete Wallet
                </Text>
                <Text className="text-sm text-red-700">
                  Permanently delete your wallet data
                </Text>
              </View>

              <Feather name="chevron-right" size={20} color="#EF4444" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Help & Support */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Help & Support
          </Text>

          <Card extraStyle="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <View className="flex-row items-start">
              <Feather name="help-circle" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-blue-900">
                  Need Help?
                </Text>
                <Text className="text-sm text-blue-700 mt-1 mb-3">
                  Our support team is available 24/7 to help you with any
                  wallet-related questions.
                </Text>
                <TouchableOpacity
                  onPress={handleContactSupport}
                  className="bg-blue-600 rounded-lg py-2 px-4 self-start"
                >
                  <Text className="text-white font-semibold text-sm">
                    Contact Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default WalletSettingsScreen;
