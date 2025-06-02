// screens/main/components/profileScreens/profile/AccountScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import {
  TopBar,
  Card,
  ProfileCard,
  BottomSheet,
} from "@main/components/profileScreens/components/ui";

import {
  fetchAccountData,
  closeAccount,
  CloseAccountResponse,
  AccountData,
} from "@main/services/account";
import {
  updateAccountField,
  requestFieldChange,
  verifyFieldChange,
} from "@main/services/fieldChange";
import {
  fetchInvestmentLimitData,
  InvestmentLimitData,
} from "@main/services/InvestmentLimit";
import { getInitials } from "@main/components/profileScreens/components/ui/string";
import { requestPhoneChange, verifyPhone } from "@main/services/phone";

const emailValid = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
const tnPhone = /^(?:\+216|216|0)?\d{8}$/;
const frPhone = /^(?:\+33|33|0)[1-9]\d{8}$/;
const phoneValid = (s: string) =>
  tnPhone.test(s.trim()) || frPhone.test(s.trim());

export default function AccountScreen() {
  // --- state ---
  const [account, setAccount] = useState<AccountData | null>(null);
  const [limitData, setLimitData] = useState<InvestmentLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // sheet + modal state
  const [isUpdateSheetVisible, setUpdateSheetVisible] = useState(false);
  const [isSwitchSheetVisible, setSwitchSheetVisible] = useState(false);
  const [isCloseModalVisible, setCloseModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // close account state
  const [closePassword, setClosePassword] = useState("");
  const [closeError, setCloseError] = useState("");
  const [closeWarnings, setCloseWarnings] = useState<string[]>([]);

  // update-flow state
  const [updateType, setUpdateType] = useState<"email" | "phone" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [validationErr, setValidationErr] = useState("");
  const [verifyErr, setVerifyErr] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // --- data loading ---
  const loadAll = async () => {
    try {
      const [acct, lim] = await Promise.all([
        fetchAccountData(),
        fetchInvestmentLimitData(),
      ]);
      setAccount(acct);
      setLimitData(lim);
      setError(null);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
  };

  // --- update flows ---
  const handleUpdatePress = (t: "email" | "phone") => {
    if (!account) return;
    setUpdateType(t);
    setInputValue(t === "email" ? account.email : account.phone);
    setValidationErr("");
    setVerifyErr("");
    setAwaitingCode(false);
    setUpdateSheetVisible(true);
  };
  const handleSwitchPress = () => setSwitchSheetVisible(true);
  const handleCloseSheet = () => {
    setUpdateSheetVisible(false);
    setSwitchSheetVisible(false);
    setUpdateType(null);
    setAwaitingCode(false);
    setCodeInput("");
    setValidationErr("");
    setVerifyErr("");
  };

  const handleSave = async () => {
    if (!account || !updateType) return;
    const trimmed = inputValue.trim();
    if (
      (updateType === "email" && !emailValid(trimmed)) ||
      (updateType === "phone" && !phoneValid(trimmed))
    ) {
      setValidationErr(
        updateType === "email"
          ? "Please enter a valid email address."
          : "Phone must be Tunisian or French."
      );
      return;
    }
    const res = await requestFieldChange(account.email, updateType, trimmed);
    if (!res.ok) {
      setValidationErr(res.message || "Request failed.");
      return;
    }
    setAwaitingCode(true);
  };

  const handleVerify = async () => {
    if (!account || !updateType) return;
    const res = await verifyFieldChange(account.email, updateType, codeInput);
    if (!res.ok) {
      setVerifyErr("Invalid or expired code.");
      return;
    }
    await updateAccountField(account.email, updateType, res.newValue!);
    setAccount({ ...account, [updateType]: res.newValue! });
    handleCloseSheet();
  };

  const confirmCloseAccount = async () => {
    if (!account || !closePassword.trim()) {
      setCloseError("Password is required to close account");
      return;
    }

    setIsClosing(true);
    setCloseError("");
    setCloseWarnings([]);

    try {
      console.log("🔄 Attempting to close account...");
      const result = await closeAccount(closePassword.trim());

      if (result.success) {
        console.log("✅ Account closed successfully");
        Alert.alert(
          "Account Closed",
          "Your account has been permanently closed and deleted. You will be redirected to the login screen where you can create a new account if desired.",
          [
            {
              text: "Continue",
              onPress: () => {
                setCloseModalVisible(false);
                router.replace("/auth/screens/Login");
              },
            },
          ]
        );
      } else {
        // Handle warnings
        if (result.warnings && result.warnings.length > 0) {
          setCloseWarnings(result.warnings);
          setCloseError(result.message);
        } else {
          setCloseError(result.message);
        }
      }
    } catch (error) {
      console.error("❌ Error closing account:", error);

      // More specific error handling
      let errorMessage = "Failed to close account";

      if (error instanceof Error) {
        if (error.message.includes("Invalid password")) {
          errorMessage =
            "The password you entered is incorrect. Please try again.";
        } else if (error.message.includes("Network request failed")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("No authentication token")) {
          errorMessage = "Session expired. Please log in again.";
          // Redirect to login after a delay
          setTimeout(() => {
            router.replace("/auth/screens/Login");
          }, 2000);
        } else if (error.message.includes("Server error")) {
          errorMessage =
            "Server error. Please try again later or contact support.";
        } else {
          errorMessage = error.message;
        }
      }

      setCloseError(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  const handleCloseAccountPress = () => {
    setCloseModalVisible(true);
    setClosePassword("");
    setCloseError("");
    setCloseWarnings([]);
  };

  const handlePhoneUpdate = async () => {
    if (!account) return;

    try {
      console.log("📱 Starting phone update for user:", account.id);
      console.log("📱 Current phone:", account.phone);
      console.log("📱 New phone:", newPhone);

      setError("");
      setIsVerifying(true);
      const result = await requestPhoneChange(account.id, newPhone);

      console.log("📱 Phone change request completed");
      setShowPhoneModal(false);
      setShowVerificationModal(true);

      if (result.code) {
        console.log("📱 Setting verification code from response:", result.code);
        setVerificationCode(result.code);
      }
    } catch (err) {
      console.error("❌ Phone update error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!account) return;

    try {
      console.log("🔐 Starting phone verification");
      console.log("🔐 User ID:", account.id);
      console.log("🔐 Verification code:", verificationCode);

      setError("");
      setIsVerifying(true);
      const result = await verifyPhone(account.id, verificationCode);

      console.log("✅ Phone verification successful:", result);
      setShowVerificationModal(false);
      // Refresh account data to show new phone
      await onRefresh();
      console.log("✅ Account data refreshed with new phone");
    } catch (err) {
      console.error("❌ Phone verification error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  // --- render states ---
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  if (error || !account || !limitData)
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-red-600">{error || "Unknown error"}</Text>
      </View>
    );

  // --- derived ---
  const initials = getInitials(account.name);
  const { investedThisYear, annualLimit } = limitData;
  const usedPct = Math.round((investedThisYear / annualLimit) * 100);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingTop: 16 }}
      >
        <TopBar title="Your Account" onBackPress={() => router.back()} />

        <View className="pt-4 px-4">
          <Card>
            <Text className="text-base font-semibold text-surfaceText">
              Korpor since {account.korporSince}
            </Text>
            <Text className="mt-1 text-sm text-mutedText">{account.intro}</Text>
          </Card>

          <ProfileCard
            initials={initials}
            name={account.name}
            email={account.email}
            phone={account.phone}
            accountType={account.accountType}
            onEmailUpdate={() => handleUpdatePress("email")}
            onPhoneUpdate={() => handleUpdatePress("phone")}
            onSwitchAccount={handleSwitchPress}
          />

          {/* Investment Limit */}
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-sm text-mutedText">Investment Limit</Text>
                <Text className="text-base font-semibold text-surfaceText">
                  {usedPct}% used
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/main/components/profileScreens/profile/InvestmentLimit"
                  )
                }
              >
                <Text className="text-base font-medium text-text">View</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-mutedText">
              TND {investedThisYear.toLocaleString()} /{" "}
              {annualLimit.toLocaleString()}
            </Text>
          </Card>

          <View className="py-4 mb-4">
            <Text className="text-sm text-mutedText text-center">
              You're amongst {account.globalUsers.toLocaleString()} global users
              from {account.globalCountries} different countries
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCloseAccountPress}
            className="flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm mb-4"
          >
            <Feather
              name="trash-2"
              size={20}
              color="#ef4444"
              className="mr-4"
            />
            <Text className="text-base font-medium text-red-600">
              Close Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Update Email/Phone */}
      <BottomSheet visible={isUpdateSheetVisible} onClose={handleCloseSheet}>
        {!awaitingCode ? (
          <>
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-inputBg items-center justify-center mb-4">
                <Feather
                  name={updateType === "email" ? "mail" : "phone"}
                  size={24}
                  color="#000"
                />
              </View>
              <Text className="text-xl font-semibold text-surfaceText text-center">
                Need help updating information?
              </Text>
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-text mb-2">
                {updateType === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <TextInput
                className="border border-border rounded-lg p-4 text-base bg-inputBg"
                value={inputValue}
                onChangeText={(t) => {
                  setInputValue(t);
                  setValidationErr("");
                }}
                keyboardType={
                  updateType === "email" ? "email-address" : "phone-pad"
                }
                autoCapitalize="none"
              />
              {validationErr ? (
                <Text className="text-destructive text-sm mt-2">
                  {validationErr}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary rounded-lg p-4 items-center mb-4"
            >
              <Text className="text-primaryText font-medium text-base">
                Save Changes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCloseSheet}
              className="rounded-lg p-4 items-center border border-border"
            >
              <Text className="text-text font-medium text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Send message clicked")}
              className="flex-row items-center justify-center mt-6"
            >
              <Text className="text-surfaceText font-medium mr-2">
                Send us a message
              </Text>
              <Feather name="message-circle" size={18} color="#000" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="items-center mb-6">
              <Text className="text-xl font-semibold text-surfaceText text-center">
                Enter the 6-digit code
              </Text>
              <Text className="text-sm text-mutedText text-center mt-2">
                Check your {updateType === "email" ? "email" : "SMS"} for a
                verification code.
              </Text>
            </View>
            <TextInput
              className="border border-border rounded-lg p-4 text-center text-base tracking-widest bg-inputBg mb-4"
              maxLength={6}
              keyboardType="number-pad"
              value={codeInput}
              onChangeText={(t) => {
                setCodeInput(t);
                setVerifyErr("");
              }}
            />
            {verifyErr ? (
              <Text className="text-destructive text-sm mb-3 text-center">
                {verifyErr}
              </Text>
            ) : null}
            <TouchableOpacity
              onPress={handleVerify}
              className="bg-primary rounded-lg p-4 items-center mb-4"
            >
              <Text className="text-primaryText font-medium text-base">
                Verify
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCloseSheet}
              className="rounded-lg p-4 items-center border border-border"
            >
              <Text className="text-text font-medium text-base">Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheet>

      {/* Switch to Business */}
      <BottomSheet visible={isSwitchSheetVisible} onClose={handleCloseSheet}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-inputBg items-center justify-center mb-4">
            <Feather name="briefcase" size={28} color="#000" />
          </View>
          <Text className="text-xl font-semibold text-surfaceText text-center mb-2">
            Switch to Business
          </Text>
          <Text className="text-sm text-mutedText text-center mb-6">
            If you would like to invest on behalf of your business we will need
            a few more details about your institution and its key stakeholders.
            Please contact us to switch your profile!
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => console.log("Get in touch clicked")}
          className="bg-primary rounded-lg p-4 items-center mb-4 flex-row justify-center"
        >
          <Text className="text-primaryText font-medium text-base mr-2">
            Get in touch
          </Text>
          <Feather name="message-circle" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCloseSheet}
          className="rounded-lg p-4 items-center border border-border"
        >
          <Text className="text-text font-medium text-base">Cancel</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Confirm Close Account */}
      <BottomSheet
        visible={isCloseModalVisible}
        onClose={() => setCloseModalVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="trash-2" size={28} color="#ef4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Close Account
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            This action cannot be undone. Your account and all associated data
            will be permanently deleted.
          </Text>

          {/* Warnings if any */}
          {closeWarnings.length > 0 && (
            <View className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <Text className="text-orange-800 font-semibold mb-2">
                ⚠️ Please note:
              </Text>
              {closeWarnings.map((warning, index) => (
                <Text key={index} className="text-orange-700 text-sm mb-1">
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          {/* Password Input */}
          <View className="w-full mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm
            </Text>
            <TextInput
              value={closePassword}
              onChangeText={(text) => {
                setClosePassword(text);
                setCloseError("");
              }}
              placeholder="Password"
              secureTextEntry
              className="border border-gray-300 rounded-lg p-3 w-full"
            />
          </View>

          {/* Error Message */}
          {closeError ? (
            <Text className="text-red-500 text-sm mb-4 text-center">
              {closeError}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={confirmCloseAccount}
            disabled={isClosing || !closePassword.trim()}
            className={`rounded-lg p-4 w-full items-center mb-3 ${
              isClosing || !closePassword.trim() ? "bg-gray-300" : "bg-red-600"
            }`}
            activeOpacity={0.8}
          >
            {isClosing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">
                Close Account Permanently
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCloseModalVisible(false)}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Phone Update Modal */}
      <BottomSheet
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      >
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Verify Phone Number
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Please enter the verification code sent to your old phone number.
          </Text>

          <TextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter verification code"
            keyboardType="number-pad"
            maxLength={6}
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {error ? (
            <Text className="text-red-500 text-sm mb-4">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerifyCode}
            disabled={isVerifying}
            className="bg-primary rounded-lg p-3 items-center"
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Phone Update Form */}
      <BottomSheet
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      >
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Update Phone Number
          </Text>

          <TextInput
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder="Enter new phone number"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {error ? (
            <Text className="text-red-500 text-sm mb-4">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handlePhoneUpdate}
            disabled={isVerifying}
            className="bg-primary rounded-lg p-3 items-center"
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
