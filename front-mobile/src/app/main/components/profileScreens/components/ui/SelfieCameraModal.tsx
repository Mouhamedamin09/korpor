import React, { useEffect } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

const { width } = Dimensions.get("window");

export default function SelfieCameraModal({
  visible,
  onClose,
  onCapture,
}: Props) {
  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Camera permission is required!");
          onClose();
        }
      })();
    }
  }, [visible]);

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: false,
      });
      if (!result.canceled) {
        onCapture(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to open camera.");
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container]}>
        <ActivityIndicator size="large" color="#000" />
        <View style={{ marginTop: 20 }}>
          <Button title="Take Selfie" onPress={openCamera} />
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
