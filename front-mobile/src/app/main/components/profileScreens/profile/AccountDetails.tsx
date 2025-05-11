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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";

import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import ProfileCard from "@main/components/profileScreens/components/ui/ProfileCard";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";

import {
  fetchAccountData,
  updateAccountField,
  requestAccountClosure,
  /* ★ NEW ↓ */
  requestFieldChange,
  verifyFieldChange,
  /* ★ NEW ↑ */
  AccountData,
} from "@main/services/api";
import { getInitials } from "@main/components/profileScreens/components/ui/string";

/* ★ NEW – local validators */
const emailValid = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());
const tnPhone = /^(?:\+216|216|0)?\d{8}$/;
const frPhone = /^(?:\+33|33|0)[1-9]\d{8}$/;
const phoneValid = (s: string) =>
  tnPhone.test(s.trim()) || frPhone.test(s.trim());

const AccountScreen: React.FC = () => {
  /* ───────────── state ───────────── */
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* sheets & modal visibility */
  const [isUpdateSheetVisible, setUpdateSheetVisible] = useState(false);
  const [isSwitchSheetVisible, setSwitchSheetVisible] = useState(false);
  const [updateType, setUpdateType] = useState<"email" | "phone" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const [isCloseModalVisible, setCloseModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  /* ★ NEW – verification phase */
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [validationErr, setValidationErr] = useState("");
  const [verifyErr, setVerifyErr] = useState("");

  /* ───────────── fetch user once ───────────── */
  useEffect(() => {
    fetchAccountData()
      .then((data) => {
        setAccount(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load account data.");
        setLoading(false);
      });
  }, []);

  /* ───────────── handlers ───────────── */
  const handleUpdatePress = (t: "email" | "phone") => {
    if (!account) return;
    setUpdateType(t);
    setInputValue(t === "email" ? account.email : account.phone);
    setValidationErr("");
    setVerifyErr("");
    setAwaitingCode(false); // ★ NEW
    setUpdateSheetVisible(true);
  };

  const handleSwitchPress = () => setSwitchSheetVisible(true);

  const handleCloseSheet = () => {
    setUpdateSheetVisible(false);
    setSwitchSheetVisible(false);
    setUpdateType(null);
    /* ★ NEW */
    setAwaitingCode(false);
    setCodeInput("");
    setValidationErr("");
    setVerifyErr("");
  };

  /* ★ NEW – STEP 1 */
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
    setAwaitingCode(true); // proceed to code entry
  };

  /* ★ NEW – STEP 2 */
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
    if (!account) return;
    setIsClosing(true);
    try {
      await requestAccountClosure(account.email);
      console.log("Account closed ✅");
    } finally {
      setIsClosing(false);
      setCloseModalVisible(false);
    }
  };

  /* ───────────── loading / error ───────────── */
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  if (error || !account)
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-500">{error || "Unknown error"}</Text>
      </View>
    );

  const initials = getInitials(account.name);

  /* ───────────── UI ───────────── */
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <TopBar title="Your Account" onBackPress={() => router.back()} />

        {/* Banner */}
        <View className="pt-4 px-4">
          <Card>
            <Text className="text-base font-semibold text-gray-900">
              Korpor since {account.korporSince}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">{account.intro}</Text>
          </Card>

          {/* Profile card */}
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

          {/* Investment limit */}
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-sm text-gray-600">Investment Limit</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {account.investmentUsedPct}% used
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/main/components/profileScreens/profile/InvestmentLimit"
                  )
                }
              >
                <Text className="text-base font-medium text-gray-700">
                  View
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-600">
              TN{" "}
              {Math.round(
                (account.investmentUsedPct / 100) * account.investmentTotal
              )}{" "}
              / {account.investmentTotal.toLocaleString()}
            </Text>
          </Card>

          {/* Global users */}
          <View className="py-4 mb-4">
            <Text className="text-sm text-gray-600 text-center">
              You’re amongst {account.globalUsers.toLocaleString()} global users
              from {account.globalCountries} different countries
            </Text>
          </View>

          {/* Close account */}
          <TouchableOpacity
            onPress={() => setCloseModalVisible(true)}
            className="flex-row items-center justify-center rounded-xl border border-gray-300 bg-white p-4 shadow-sm mb-4"
          >
            <Feather
              name="trash-2"
              size={20}
              color="#111827"
              className="mr-4"
            />
            <Text className="text-base font-medium text-gray-900">
              Close Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ░░░ Update Info Sheet ░░░ */}
      <BottomSheet visible={isUpdateSheetVisible} onClose={handleCloseSheet}>
        {/* STEP 1  */}
        {!awaitingCode && (
          <>
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Feather
                  name={updateType === "email" ? "mail" : "phone"}
                  size={24}
                  color="#111827"
                />
              </View>
              <Text className="text-xl font-semibold text-gray-900 text-center">
                Need help updating information?
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {updateType === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-4 text-base bg-gray-50"
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
                <Text className="text-red-500 text-sm mt-2">
                  {validationErr}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-gray-900 rounded-lg p-4 items-center mb-4"
            >
              <Text className="text-white font-medium text-base">
                Save Changes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCloseSheet}
              className="rounded-lg p-4 items-center border border-gray-300"
            >
              <Text className="text-gray-700 font-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("Send message clicked")}
              className="flex-row items-center justify-center mt-6"
            >
              <Text className="text-gray-900 font-medium mr-2">
                Send us a message
              </Text>
              <Feather name="message-circle" size={18} color="#111827" />
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2 */}
        {awaitingCode && (
          <>
            <View className="items-center mb-6">
              <Text className="text-xl font-semibold text-gray-900 text-center">
                Enter the 6-digit code
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                Check your {updateType === "email" ? "email" : "SMS"} for a
                verification code.
              </Text>
            </View>

            <TextInput
              className="border border-gray-300 rounded-lg p-4 text-center text-base tracking-widest bg-gray-50 mb-4"
              maxLength={6}
              keyboardType="number-pad"
              value={codeInput}
              onChangeText={(t) => {
                setCodeInput(t);
                setVerifyErr("");
              }}
            />

            {verifyErr ? (
              <Text className="text-red-500 text-sm mb-3 text-center">
                {verifyErr}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={handleVerify}
              className="bg-gray-900 rounded-lg p-4 items-center mb-4"
            >
              <Text className="text-white font-medium text-base">Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCloseSheet}
              className="rounded-lg p-4 items-center border border-gray-300"
            >
              <Text className="text-gray-700 font-medium text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheet>

      {/* ░░░ Switch Account Sheet ░░░ */}
      <BottomSheet visible={isSwitchSheetVisible} onClose={handleCloseSheet}>
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Feather name="briefcase" size={28} color="#111827" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
            Switch to Business
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            If you would like to invest on behalf of your business we will need
            a few more details about your institution and its key stakeholders.
            Please contact us to switch your profile!
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => console.log("Get in touch clicked")}
          className="bg-gray-900 rounded-lg p-4 items-center mb-4 flex-row justify-center"
        >
          <Text className="text-white font-medium text-base mr-2">
            Get in touch
          </Text>
          <Feather name="message-circle" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCloseSheet}
          className="rounded-lg p-4 items-center border border-gray-300"
        >
          <Text className="text-gray-700 font-medium text-base">Cancel</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ░░░ Close-Account Modal ░░░ */}
      <Modal
        transparent
        animationType="fade"
        visible={isCloseModalVisible}
        onRequestClose={() => setCloseModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full rounded-lg bg-white p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Close Account
            </Text>
            <Text className="text-sm text-gray-700 mb-6">
              Do you really want to close your account?
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setCloseModalVisible(false)}
                className="h-10 px-4 mr-3 items-center justify-center rounded-md border border-gray-300 bg-white"
              >
                <Text className="text-base font-medium text-gray-900">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isClosing}
                onPress={confirmCloseAccount}
                className="h-10 px-4 items-center justify-center rounded-md bg-black"
              >
                {isClosing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-base font-medium text-white">
                    Accept
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountScreen;
