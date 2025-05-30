import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import DocumentScanner, {
  ResponseType,
  ScanDocumentOptions,
} from "react-native-document-scanner-plugin";
import { submitAddressVerification } from "@main/services/Verification";

const { width } = Dimensions.get("window");

export default function UploadAddressScreen() {
  const [addressUri, setAddressUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const scanAddress = async () => {
    try {
      const options: ScanDocumentOptions & { overlayColor: string } = {
        maxNumDocuments: 1,
        responseType: ResponseType.ImageFilePath,
        overlayColor: "#ffffff40",
      };
      const { scannedImages } = await DocumentScanner.scanDocument(options);
      if (scannedImages.length) setAddressUri(scannedImages[0]);
    } catch {}
  };

  const onVerify = async () => {
    if (!addressUri) return;
    setSubmitting(true);
    await submitAddressVerification(addressUri);
    setSubmitting(false);
    router.push(
      "main/components/profileScreens/profile/CompleteAccountSetupScreen"
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Verify your address
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-4">
        <Text className="text-sm text-gray-500 mb-4">
          Please scan a document showing your current address.
        </Text>

        <TouchableOpacity
          onPress={scanAddress}
          className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 mb-3 shadow"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="home" size={16} color="#000" />
            </View>
            <Text className="text-base font-medium text-gray-900">
              Scan address proof
            </Text>
          </View>
          {addressUri ? (
            <Feather name="check-circle" size={20} color="#10B981" />
          ) : (
            <Feather name="chevron-right" size={20} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVerify}
          disabled={!addressUri || submitting}
          className={`mt-6 rounded-lg p-4 items-center ${
            addressUri ? "bg-black" : "bg-gray-300"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-medium text-white">
              Verify address
            </Text>
          )}
        </TouchableOpacity>

        {addressUri && (
          <View className="mt-6 items-center">
            <Text className="text-sm text-gray-500 mb-2">Document preview</Text>
            <Image
              source={{ uri: addressUri }}
              style={{ width: width * 0.6, height: width * 0.4 }}
              className="rounded-lg"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
