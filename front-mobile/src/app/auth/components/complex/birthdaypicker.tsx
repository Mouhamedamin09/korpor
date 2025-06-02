import { View, Modal, TouchableWithoutFeedback, Animated } from "react-native";

import DatePicker from "react-native-modern-datepicker";
import React, { useEffect, useRef } from "react";
import { datePickerOptions, datePickerStyles } from "@shared/constants/styles";

export default function BirthdayPicker({
  isBirthdayPickerVisible,
  onSelectDate,
  setIsBirthdayPickerVisible,
}: {
  isBirthdayPickerVisible: boolean;
  onSelectDate: (date: string) => void;
  setIsBirthdayPickerVisible: (value: boolean) => void;
}) {
  const slideAnim = useRef(new Animated.Value(500)).current; // Start off-screen

  useEffect(() => {
    if (isBirthdayPickerVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide into view
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500, // Slide out of view
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isBirthdayPickerVisible]);

  const handleDateSelect = (date: any) => {
    try {
      console.log("Raw date from picker:", date, typeof date);

      let formattedDate: string;

      if (typeof date === "string") {
        // If it's already a string, use it
        formattedDate = date;
      } else if (date && typeof date === "object") {
        // If it's an object (moment-like), try to extract the date string
        if (date._i) {
          formattedDate = date._i; // moment.js initial value
        } else if (date.toString) {
          formattedDate = date.toString();
        } else {
          // Fallback to ISO date
          formattedDate = new Date().toISOString().split("T")[0];
        }
      } else {
        // Fallback to current date
        formattedDate = new Date().toISOString().split("T")[0];
      }

      // Ensure the date is in YYYY-MM-DD format
      if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Try to parse and reformat
        const parsedDate = new Date(formattedDate);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split("T")[0];
        } else {
          // If parsing fails, use current date
          formattedDate = new Date().toISOString().split("T")[0];
        }
      }

      console.log("Formatted date:", formattedDate);
      onSelectDate(formattedDate);
    } catch (error) {
      console.error("Error processing selected date:", error);
      // Fallback to current date if there's an error
      const today = new Date().toISOString().split("T")[0];
      onSelectDate(today);
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isBirthdayPickerVisible}
    >
      <TouchableWithoutFeedback
        onPress={() => setIsBirthdayPickerVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                padding: 16,
                borderRadius: 10,
              }}
            >
              <DatePicker
                onSelectedChange={handleDateSelect}
                mode="calendar"
                style={datePickerStyles}
                options={datePickerOptions}
                current="2000-01-01"
                selected="2000-01-01"
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
