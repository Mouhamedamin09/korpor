import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";

import DocumentScanner, {
  ResponseType,
  ScanDocumentOptions, // ★ needed for the cast workaround
} from "react-native-document-scanner-plugin";
import * as ImagePicker from "expo-image-picker";

const VerificationProgressScreen: React.FC = () => {
  /* ─────────────────── state ─────────────────── */
  const [passportUri, setPassportUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const allDone = !!passportUri && !!selfieUri;

  /* ─────────────────── helpers ─────────────────── */
  const openGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) setPassportUri(res.assets[0].uri);
  };

  const scanWithCamera = async () => {
    try {
      /* ---------- workaround: extend type to accept overlayColor ---------- */
      type OptionsWithOverlay = ScanDocumentOptions & { overlayColor: string };

      const options: OptionsWithOverlay = {
        maxNumDocuments: 1,
        responseType: ResponseType.ImageFilePath,
        overlayColor: "#ffffff40", // translucent white frame
      };
      /* ------------------------------------------------------------------- */

      const { scannedImages } = await DocumentScanner.scanDocument(options);
      if (scannedImages.length) setPassportUri(scannedImages[0]);
    } catch (e) {
      console.log("Scan cancelled", e);
    }
  };

  const handlePassport = () =>
    Alert.alert(
      "Submit passport",
      "Choose how to provide your passport:",
      [
        { text: "Camera", onPress: scanWithCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );

  const handleSelfie = () =>
    Alert.alert("Selfie capture TODO (implement later)");

  /* ─────────────────── UI ─────────────────── */
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Verification Progress
        </Text>
        <View style={{ width: 24 }} />
        {/* placeholder for symmetry */}
      </View>

      <View className="px-4">
        <Text className="text-sm text-gray-500 mb-4">
          Please go through the following steps to complete the verification
          journey.
        </Text>

        {/* Passport row */}
        <TouchableOpacity
          onPress={handlePassport}
          className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 mb-2 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="file-text" size={16} color="#000" />
            </View>
            <Text className="text-base font-medium text-gray-900">
              Passport
            </Text>
          </View>

          <View className="flex-row items-center">
            {passportUri ? (
              <Feather name="check-circle" size={20} color="#10B981" />
            ) : (
              <>
                <Text className="text-sm text-gray-500 mr-2">
                  Not Submitted
                </Text>
                <Feather name="chevron-right" size={20} color="#000" />
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Selfie row */}
        <TouchableOpacity
          onPress={handleSelfie}
          className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="camera" size={16} color="#000" />
            </View>
            <Text className="text-base font-medium text-gray-900">Selfie</Text>
          </View>

          <View className="flex-row items-center">
            {selfieUri ? (
              <Feather name="check-circle" size={20} color="#10B981" />
            ) : (
              <>
                <Text className="text-sm text-gray-500 mr-2">
                  Not Submitted
                </Text>
                <Feather name="chevron-right" size={20} color="#000" />
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Next button */}
        <TouchableOpacity
          onPress={() => console.log("Next clicked")}
          disabled={!allDone}
          className={`mt-6 rounded-lg p-4 items-center justify-center ${
            allDone ? "bg-black" : "bg-gray-300"
          }`}
        >
          <Text className="text-base font-medium text-white">Next</Text>
        </TouchableOpacity>

        {/* Preview (optional) */}
        {passportUri && (
          <View className="mt-6 items-center">
            <Text className="text-sm text-gray-500 mb-2">Passport preview</Text>
            <Image
              source={{ uri: passportUri }}
              style={{ width: 160, height: 110, borderRadius: 8 }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default VerificationProgressScreen;
