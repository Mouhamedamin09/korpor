// ../../screens/main/components/profileScreens/profile/UploadPassportScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Feather from "react-native-vector-icons/Feather";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator"; // ★ NEW

const UploadPassportScreen: React.FC = () => {
  const router = useRouter();

  /* ───────── local state for the info sheet ───────── */
  const [isInfoSheetVisible, setInfoSheetVisible] = useState(false); // ★ NEW

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {/* Top Bar */}
        <TopBar
          title="Upload your passport"
          onBackPress={() => router.back()}
        />

        <View className="px-4 py-4">
          {/* Intro */}
          <Text className="text-xl font-semibold text-gray-900">
            In order to register you as the legal owner of each property you
            invest in, we require you to upload your passport for verification
            of your identity.
          </Text>

          {/* Why do we need this? (opens sheet) */}
          <TouchableOpacity
            onPress={() => setInfoSheetVisible(true)} // ★ NEW
            className="mt-3 border border-black rounded-lg px-4 py-2 flex-row items-center justify-center bg-white"
          >
            <Text className="text-base font-medium text-black">
              Why do we need this?
            </Text>
          </TouchableOpacity>

          {/* Instructions grid */}
          <View className="mt-6">
            {/* Row 1 */}
            <View className="flex-row justify-between mb-4">
              {/* Good photo */}
              <View className="w-[48%]">
                <View className="relative h-32 rounded-xl bg-gray-100 items-center justify-center">
                  <Image
                    source={require("@assets/normal.png")}
                    style={{ width: 155, height: 105 }}
                  />
                  <View className="absolute right-2 top-2">
                    <Feather name="check-circle" size={20} color="#10B981" />
                  </View>
                </View>
                <Text className="mt-2 text-sm font-medium text-gray-900 text-center">
                  Show all details, including the line code at the bottom
                </Text>
              </View>

              {/* No screen photos */}
              <View className="w-[48%]">
                <View className="relative h-32 rounded-xl bg-gray-100 items-center justify-center">
                  <Image
                    source={require("@assets/laptop.png")}
                    style={{ width: 155, height: 105 }}
                  />
                  <View className="absolute right-2 top-2">
                    <Feather name="x-circle" size={20} color="#EF4444" />
                  </View>
                </View>
                <Text className="mt-2 text-sm font-medium text-gray-900 text-center">
                  No photos captured from another screen
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row justify-between">
              {/* No glare */}
              <View className="w-[48%]">
                <View className="relative h-32 rounded-xl bg-gray-100 items-center justify-center">
                  <Image
                    source={require("@assets/glare.png")}
                    style={{ width: 155, height: 105 }}
                  />
                  <View className="absolute right-2 top-2">
                    <Feather name="x-circle" size={20} color="#EF4444" />
                  </View>
                </View>
                <Text className="mt-2 text-sm font-medium text-gray-900 text-center">
                  No glare or overexposed photos
                </Text>
              </View>

              {/* No cutoff */}
              <View className="w-[48%]">
                <View className="relative h-32 rounded-xl bg-gray-100 items-center justify-center">
                  <Image
                    source={require("@assets/cutoff.png")}
                    style={{ width: 155, height: 105 }}
                  />
                  <View className="absolute right-2 top-2">
                    <Feather name="x-circle" size={20} color="#EF4444" />
                  </View>
                </View>
                <Text className="mt-2 text-sm font-medium text-gray-900 text-center">
                  No overcropped or cutoff photos
                </Text>
              </View>
            </View>
          </View>

          {/* Verify button */}
          <TouchableOpacity
            onPress={() =>
              router.push(
                "main/components/profileScreens/profile/VerificationProgressScreen"
              )
            }
            className="mt-8 rounded-lg bg-black px-4 py-4 items-center justify-center"
          >
            <Text className="text-base font-semibold text-white">
              Verify passport
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ───────── Why-do-we-need-this? Sheet ───────── */}
      <BottomSheet
        visible={isInfoSheetVisible}
        onClose={() => setInfoSheetVisible(false)}
      >
        <Text className="text-lg font-semibold text-gray-900 text-center mb-4">
          Why do we need this?
        </Text>
        <Text className="text-sm text-gray-700 text-center">
          Uploading your passport is a mandatory step for financial regulations.
          This allows us to verify your identity and ensures that your account
          is secure, your property is registered under your name and your funds
          are safe from fraud and money laundering.
        </Text>
      </BottomSheet>
    </>
  );
};

export default UploadPassportScreen;
