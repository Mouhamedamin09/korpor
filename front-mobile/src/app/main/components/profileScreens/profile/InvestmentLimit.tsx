import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import { Progress } from "@main/components/profileScreens/components/ui/progress";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";

const InvestmentLimitScreen: React.FC = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);

  const handleInvestorPress = () => {
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <TopBar
        title="Annual investment limit"
        onBackPress={() => console.log("Back clicked")}
      />

      <ScrollView className="flex-1 px-5 py-4">
        {/* Main progress card */}
        <Card>
          <Text className="text-2xl font-bold text-center text-gray-900 mb-4">
            0% of limit used
          </Text>
          <Progress value={0} className="h-2.5 mb-6 bg-gray-100" />

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-900 mr-2.5" />
                <Text className="text-gray-700 text-sm font-medium">
                  Invested this year
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">TND 0</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-300 mr-2.5" />
                <Text className="text-gray-700 text-sm font-medium">
                  Available to invest
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">TND 367,000</Text>
            </View>
          </View>
        </Card>

        {/* Investor Type Button */}
        <TouchableOpacity
          className="mb-5 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex-row items-center justify-between"
          onPress={handleInvestorPress}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
              <Feather name="user" size={18} color="#000000" />
            </View>
            <View>
              <Text className="font-medium text-gray-900 text-base">
                Retail investor
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                TND 367,000 annual limit
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-500 mr-1 text-sm font-medium">
              Update
            </Text>
            <Feather name="chevron-right" size={18} color="#6b7280" />
          </View>
        </TouchableOpacity>

        {/* Info Cards */}
        <Card>
          <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
            <Feather name="calendar" size={18} color="#000000" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 mb-1.5 text-base">
              Investment limit will renew each year
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed">
              Your annual investment limit will renew on 1st January 2026
            </Text>
          </View>
        </Card>

        <Card>
          <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
            <Feather name="lock" size={18} color="#000000" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 mb-1.5 text-base">
              Why do we have limits?
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed">
              Local regulations limit retail investors to a maximum of USD
              100,000 (TND 367,000) invested on the Stake platform per calendar
              year.
            </Text>
          </View>
        </Card>

        <Card>
          <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-4">
            <Feather name="trending-up" size={18} color="#000000" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 mb-1.5 text-base">
              How do I become a professional investor?
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed">
              If you have assets worth over USD 1 million, please reach out to
              our support team to classify as a professional investor. This
              removes all investment limits and allows card-based deposits.
            </Text>
            <TouchableOpacity
              className="mt-3"
              onPress={() => console.log("Contact support")}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900 font-medium text-sm">
                Contact support →
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      {/* BottomSheet for Investor Type */}
      <BottomSheet visible={isSheetVisible} onClose={closeSheet}>
        <View className="items-center justify-center px-3 pb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Feather name="user" size={28} color="#6b7280" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Investor type
          </Text>
          <Text className="text-center text-gray-600 text-sm mb-4 leading-relaxed">
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
            <Text className="text-white text-sm font-medium">Get in touch</Text>
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
