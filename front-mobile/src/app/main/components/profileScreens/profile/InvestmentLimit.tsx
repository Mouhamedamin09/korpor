// screens/main/components/profileScreens/profile/InvestmentLimitScreen.tsx
import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import {
  TopBar,
  Card,
  Progress,
  BottomSheet,
} from "@main/components/profileScreens/components/ui";

const InvestmentLimitScreen: React.FC = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const handleInvestorPress = () => setSheetVisible(true);
  const closeSheet = () => setSheetVisible(false);

  return (
    <View className="flex-1 bg-background">
      <TopBar
        title="Annual investment limit"
        onBackPress={() => console.log("Back clicked")}
      />

      <ScrollView className="flex-1 px-5 py-4">
        <Card>
          <Text className="text-2xl font-bold text-center text-surfaceText mb-4">
            0% of limit used
          </Text>
          <Progress value={0} className="h-2.5 mb-6 bg-mutedBg" />

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-surfaceText mr-2.5" />
                <Text className="text-sm font-medium text-mutedText">
                  Invested this year
                </Text>
              </View>
              <Text className="font-semibold text-surfaceText">TND 0</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-300 mr-2.5" />
                <Text className="text-sm font-medium text-mutedText">
                  Available to invest
                </Text>
              </View>
              <Text className="font-semibold text-surfaceText">
                TND 367,000
              </Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity
          onPress={handleInvestorPress}
          activeOpacity={0.7}
          className="mb-5 bg-surface rounded-xl border border-border shadow-sm p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-mutedBg items-center justify-center mr-3">
              <Feather name="user" size={18} color="#000000" />
            </View>
            <View>
              <Text className="text-base font-medium text-surfaceText">
                Retail investor
              </Text>
              <Text className="text-xs text-textGray mt-0.5">
                TND 367,000 annual limit
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-textGray mr-1">
              Update
            </Text>
            <Feather name="chevron-right" size={18} color="#71717a" />
          </View>
        </TouchableOpacity>

        <Card>
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-lg bg-mutedBg items-center justify-center mr-4">
              <Feather name="calendar" size={18} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-surfaceText mb-1.5">
                Investment limit will renew each year
              </Text>
              <Text className="text-sm text-mutedText leading-relaxed">
                Your annual investment limit will renew on 1st January 2026
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-lg bg-mutedBg items-center justify-center mr-4">
              <Feather name="lock" size={18} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-surfaceText mb-1.5">
                Why do we have limits?
              </Text>
              <Text className="text-sm text-mutedText leading-relaxed">
                Local regulations limit retail investors to a maximum of USD
                100,000 (TND 367,000) invested on the Stake platform per
                calendar year.
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-lg bg-mutedBg items-center justify-center mr-4">
              <Feather name="trending-up" size={18} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-surfaceText mb-1.5">
                How do I become a professional investor?
              </Text>
              <Text className="text-sm text-mutedText leading-relaxed">
                If you have assets worth over USD 1 million, please reach out to
                our support team to classify as a professional investor. This
                removes all investment limits and allows card-based deposits.
              </Text>
              <TouchableOpacity
                onPress={() => console.log("Contact support")}
                activeOpacity={0.7}
                className="mt-3"
              >
                <Text className="text-sm font-medium text-surfaceText">
                  Contact support →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>

      <BottomSheet visible={isSheetVisible} onClose={closeSheet}>
        <View className="items-center justify-center px-3 pb-6">
          <View className="w-16 h-16 rounded-full bg-mutedBg items-center justify-center mb-4">
            <Feather name="user" size={28} color="#71717a" />
          </View>
          <Text className="text-lg font-semibold text-surfaceText mb-2">
            Investor type
          </Text>
          <Text className="text-center text-sm text-mutedText mb-4 leading-relaxed">
            If you have assets worth over USD 1 million then please reach out to
            our client support team who will help you classify as a professional
            investor, which removes all investment limits and allows you to
            deposit or invest with credit cards
          </Text>
          <TouchableOpacity
            className="bg-black px-5 py-3 rounded-xl flex-row items-center justify-center"
            onPress={() => {
              console.log("Get in touch");
              closeSheet();
            }}
          >
            <Text className="text-sm font-medium text-white">Get in touch</Text>
            <Feather
              name="message-circle"
              size={16}
              color="#ffffff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default InvestmentLimitScreen;
