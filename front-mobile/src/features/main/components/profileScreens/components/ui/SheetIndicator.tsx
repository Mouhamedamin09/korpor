// components/ui/SheetIndicator.tsx
import React, { ReactNode } from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* sheet container */}
      <View style={styles.container}>
        {/* little drag-indicator */}
        <View style={styles.indicator} />

        {/* sheet content */}
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 8,
  },
});

export default BottomSheet;
