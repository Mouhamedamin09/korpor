// screens/main/components/profileScreens/profile/InvestmentLimitScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import { Progress } from "@main/components/profileScreens/components/ui/progress";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import {
  fetchInvestmentLimitData,
  InvestmentLimitData,
} from "@main/services/InvestmentLimit";

export default function InvestmentLimitScreen() {
  const [data, setData] = useState<InvestmentLimitData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    fetchInvestmentLimitData().then(setData);
  }, []);

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const { investedThisYear, annualLimit, renewalDate, professionalThreshold } =
    data;
  const usedPct = investedThisYear / annualLimit;
  const available = annualLimit - investedThisYear;

  return (
    <View className="flex-1 bg-white">
      <TopBar
        title="Annual investment limit"
        onBackPress={() => console.log("Back clicked")}
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
      >
        {/* Progress Card */}
        <Card>
          <Text className="text-2xl font-bold text-center text-gray-900 mb-4">
            {Math.round(usedPct * 100)}% of limit used
          </Text>
          <Progress value={usedPct} className="h-2.5 mb-6" />

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-900 mr-2.5" />
                <Text className="text-sm font-medium text-gray-600">
                  Invested this year
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">
                TND {investedThisYear.toLocaleString()}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-300 mr-2.5" />
                <Text className="text-sm font-medium text-gray-600">
                  Available to invest
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">
                TND {available.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Retail investor */}
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.7}
          className="mb-5"
        >
          <Card extraStyle="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
                <Feather name="user" size={18} color="#000" />
              </View>
              <View>
                <Text className="text-base font-medium text-gray-900">
                  Retail investor
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  TND {annualLimit.toLocaleString()} annual limit
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-gray-600 mr-1">
                Update
              </Text>
              <Feather name="chevron-right" size={18} color="#71717a" />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Renew info */}
        <Card>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
              <Feather name="calendar" size={18} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1.5">
                Investment limit will renew each year
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed">
                Your annual investment limit will renew on{" "}
                {new Date(renewalDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Why limits */}
        <Card>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
              <Feather name="lock" size={18} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1.5">
                Why do we have limits?
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed">
                Local regulations limit retail investors to a maximum of USD{" "}
                {annualLimit.toLocaleString()} (TND{" "}
                {annualLimit.toLocaleString()}) invested per calendar year.
              </Text>
            </View>
          </View>
        </Card>

        {/* Pro investor */}
        <Card>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
              <Feather name="trending-up" size={18} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1.5">
                How do I become a professional investor?
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed">
                If you have assets worth over USD{" "}
                {professionalThreshold.toLocaleString()}, please contact our
                support team to classify as a professional investor. Removes all
                limits & allows card deposits.
              </Text>
              <TouchableOpacity
                onPress={() => console.log("Contact support")}
                activeOpacity={0.7}
                className="mt-3"
              >
                <Text className="text-sm font-medium text-gray-900">
                  Contact support →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* BottomSheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      >
        <View className="items-center justify-center px-4 pb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Feather name="user" size={28} color="#71717a" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Investor type
          </Text>
          <Text className="text-center text-sm text-gray-600 mb-4 leading-relaxed">
            If you have assets worth over USD{" "}
            {professionalThreshold.toLocaleString()} then reach out to support
            to remove all limits and enable card deposits.
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log("Get in touch");
              setSheetVisible(false);
            }}
            activeOpacity={0.7}
            className="bg-black px-5 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-sm font-medium text-white">Get in touch</Text>
            <Feather
              name="message-circle"
              size={16}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}
