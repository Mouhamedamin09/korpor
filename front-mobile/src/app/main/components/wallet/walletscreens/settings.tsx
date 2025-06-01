import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Switch } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";

const WalletSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoInvest, setAutoInvest] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);

  // Bottom sheet states
  const [transactionLimitsVisible, setTransactionLimitsVisible] =
    useState(false);
  const [contactSupportVisible, setContactSupportVisible] = useState(false);
  const [exportDataVisible, setExportDataVisible] = useState(false);
  const [deleteWalletVisible, setDeleteWalletVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

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
      onPress: () => setTransactionLimitsVisible(true),
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

  const handleContactSupport = () => {
    setTransactionLimitsVisible(false);
    setContactSupportVisible(true);
  };

  const handleExportData = () => {
    setExportDataVisible(true);
  };

  const handleDeleteWallet = () => {
    setDeleteWalletVisible(true);
  };

  const confirmExportData = () => {
    setExportDataVisible(false);
    // Success feedback could be another bottom sheet or toast
    console.log("Export request submitted successfully");
  };

  const confirmDeleteWallet = () => {
    setDeleteWalletVisible(false);
    setDeleteConfirmVisible(true);
  };

  const finalDeleteConfirmation = () => {
    setDeleteConfirmVisible(false);
    // Handle final delete action
    console.log("Wallet deletion confirmed");
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
                <Feather name="lock" size={20} color="#374151" />
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
      </ScrollView>

      {/* Transaction Limits Bottom Sheet */}
      <BottomSheet
        visible={transactionLimitsVisible}
        onClose={() => setTransactionLimitsVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
            <Feather name="shield" size={28} color="#3B82F6" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Transaction Limits
          </Text>
          <View className="w-full space-y-3 mb-6">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600">
                Daily Deposit Limit:
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                $10,000
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-sm text-gray-600">
                Daily Withdrawal Limit:
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                $5,000
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-gray-600">Monthly Limit:</Text>
              <Text className="text-sm font-semibold text-gray-900">
                $50,000
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 text-center mb-6">
            To request limit changes, please contact support.
          </Text>
          <TouchableOpacity
            onPress={handleContactSupport}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTransactionLimitsVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Contact Support Bottom Sheet */}
      <BottomSheet
        visible={contactSupportVisible}
        onClose={() => setContactSupportVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Feather name="message-circle" size={28} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Contact Support
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            You can reach our support team at:
          </Text>
          <View className="w-full space-y-3 mb-6">
            <View className="p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">
                Email:
              </Text>
              <Text className="text-sm text-gray-600">support@korpor.com</Text>
            </View>
            <View className="p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">
                Phone:
              </Text>
              <Text className="text-sm text-gray-600">+1 (555) 123-4567</Text>
            </View>
            <View className="p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">
                Hours:
              </Text>
              <Text className="text-sm text-gray-600">9 AM - 6 PM EST</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setContactSupportVisible(false)}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">OK</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Export Data Bottom Sheet */}
      <BottomSheet
        visible={exportDataVisible}
        onClose={() => setExportDataVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
            <Feather name="download" size={28} color="#3B82F6" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Export Data
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            Your transaction data will be prepared and sent to your registered
            email address within 24 hours.
          </Text>
          <TouchableOpacity
            onPress={confirmExportData}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setExportDataVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Delete Wallet Bottom Sheet */}
      <BottomSheet
        visible={deleteWalletVisible}
        onClose={() => setDeleteWalletVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="trash-2" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Delete Wallet
          </Text>
          <Text className="text-sm text-black text-center mb-6 font-medium">
            This action cannot be undone. All your wallet data will be
            permanently deleted. Please ensure you have withdrawn all funds
            before proceeding.
          </Text>
          <TouchableOpacity
            onPress={confirmDeleteWallet}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteWalletVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Final Delete Confirmation Bottom Sheet */}
      <BottomSheet
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="alert-triangle" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Final Confirmation
          </Text>
          <Text className="text-sm text-black text-center mb-6 font-medium">
            Are you absolutely sure? This will permanently delete your wallet
            and all associated data.
          </Text>
          <TouchableOpacity
            onPress={finalDeleteConfirmation}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Delete Forever</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteConfirmVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default WalletSettingsScreen;
