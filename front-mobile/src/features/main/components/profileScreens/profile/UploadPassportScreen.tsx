// app/screens/UploadPassportScreen.tsx

import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
// pull in the SheetIndicator directly — our barrel file didn't re-export it
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";

const UploadPassportScreen: React.FC = () => {
  const router = useRouter();
  const [isInfoSheetVisible, setInfoSheetVisible] = useState(false);

  return (
    <>
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: 16 }}>
        <TopBar
          title="Upload your passport"
          onBackPress={() => router.back()}
        />

        <View className="px-4 py-4">
          <Text className="text-xl font-semibold text-surfaceText">
            In order to register you as the legal owner of each property you
            invest in, we require you to upload your passport for verification
            of your identity.
          </Text>

          <TouchableOpacity
            onPress={() => setInfoSheetVisible(true)}
            className="mt-3 border border-border rounded-lg px-4 py-2 items-center justify-center bg-surface"
          >
            <Text className="text-base font-medium text-surfaceText">
              Why do we need this?
            </Text>
          </TouchableOpacity>

          <View className="mt-6">
            <View className="flex-row justify-between mb-4">
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
                <Text className="mt-2 text-sm font-medium text-surfaceText text-center">
                  Show all details, including the line code at the bottom
                </Text>
              </View>

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
                <Text className="mt-2 text-sm font-medium text-surfaceText text-center">
                  No photos captured from another screen
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
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
                <Text className="mt-2 text-sm font-medium text-surfaceText text-center">
                  No glare or overexposed photos
                </Text>
              </View>

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
                <Text className="mt-2 text-sm font-medium text-surfaceText text-center">
                  No overcropped or cutoff photos
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "main/components/profileScreens/profile/VerificationProgressScreen"
              )
            }
            className="mt-8 rounded-lg bg-primary px-4 py-4 items-center justify-center"
          >
            <Text className="text-base font-semibold text-primaryText">
              Verify passport
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet
        visible={isInfoSheetVisible}
        onClose={() => setInfoSheetVisible(false)}
      >
        <Text className="text-lg font-semibold text-surfaceText text-center mb-4">
          Why do we need this?
        </Text>
        <Text className="text-sm text-mutedText text-center">
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
