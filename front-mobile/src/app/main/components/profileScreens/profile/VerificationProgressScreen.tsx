// app/screens/VerificationProgressScreen.tsx

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
import { useRouter } from "expo-router";
import DocumentScanner, {
  ResponseType,
  ScanDocumentOptions,
} from "react-native-document-scanner-plugin";
import * as ImagePicker from "expo-image-picker";
import { submitIdentityVerification } from "@main/services/Verification";

const { width } = Dimensions.get("window");

export default function VerificationProgressScreen() {
  const router = useRouter();
  const [passportUri, setPassportUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allDone = !!passportUri && !!selfieUri;

  const scanWithCamera = async () => {
    try {
      type OptionsWithOverlay = ScanDocumentOptions & { overlayColor: string };
      const options: OptionsWithOverlay = {
        maxNumDocuments: 1,
        responseType: ResponseType.ImageFilePath,
        overlayColor: "#ffffff40",
      };
      const { scannedImages } = await DocumentScanner.scanDocument(options);
      if (scannedImages && scannedImages.length > 0) {
        setPassportUri(scannedImages[0]);
      }
    } catch {
      // Handle error silently or show error message
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled) setSelfieUri(result.assets[0].uri);
  };

  const handleNext = async () => {
    if (!passportUri || !selfieUri) {
      Alert.alert("Missing Documents", "Please capture both passport and selfie images.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await submitIdentityVerification(passportUri, selfieUri);
      
      if (result.qualified) {
        Alert.alert(
          "Success!", 
          "Your identity documents have been submitted for review. We'll notify you once they're verified.",
          [
            {
              text: "OK",
              onPress: () => router.push(
      "main/components/profileScreens/profile/CompleteAccountSetupScreen"
              ),
            },
          ]
        );
      } else {
        Alert.alert(
          "Upload Failed", 
          result.message || "Failed to upload documents. Please try again."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error", 
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Verification Progress
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-4">
        <Text className="text-sm text-gray-500 mb-4">
          Please go through the following steps to complete verification.
        </Text>

        <TouchableOpacity
          onPress={scanWithCamera}
          className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 mb-3 shadow"
          disabled={isSubmitting}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="file-text" size={16} color="#000" />
            </View>
            <Text className="text-base font-medium text-gray-900">
              Passport
            </Text>
          </View>
          {passportUri ? (
            <Feather name="check-circle" size={20} color="#10B981" />
          ) : (
            <Feather name="chevron-right" size={20} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takeSelfie}
          className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 shadow"
          disabled={isSubmitting}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
              <Feather name="camera" size={16} color="#000" />
            </View>
            <Text className="text-base font-medium text-gray-900">Selfie</Text>
          </View>
          {selfieUri ? (
            <Feather name="check-circle" size={20} color="#10B981" />
          ) : (
            <Feather name="chevron-right" size={20} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!allDone || isSubmitting}
          className={`mt-6 rounded-lg p-4 items-center ${
            allDone && !isSubmitting ? "bg-black" : "bg-gray-300"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
          <Text className="text-base font-medium text-white">Next</Text>
          )}
        </TouchableOpacity>

        {passportUri && (
          <View className="mt-6 items-center">
            <Text className="text-sm text-gray-500 mb-2">Passport preview</Text>
            <Image
              source={{ uri: passportUri }}
              className="w-40 h-28 rounded-lg"
            />
          </View>
        )}

        {selfieUri && (
          <View className="mt-6 items-center">
            <Text className="text-sm text-gray-500 mb-2">Selfie preview</Text>
            <Image
              source={{ uri: selfieUri }}
              className="w-40 h-40 rounded-full"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
