import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

/* ────────────── brand palette ────────────── */
const BRAND_GREEN = "#16a34a"; // Tailwind green-600
const BG_LIGHT = "#ffffff";
const BG_DIM = "#f3f4f6"; // Tailwind gray-100
const TXT_PRIMARY = "#111827"; // Tailwind gray-900
const TXT_MUTED = "#6b7280"; // Tailwind gray-500

/* ────────────── safe native date-picker import ────────────── */
let DateTimePicker: any = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch {
  console.warn("DateTimePicker not available, using fallback picker");
}

/* ────────────── fallback picker (cross-platform) ────────────── */
const FallbackDatePicker = ({
  selectedDate,
  onDateChange,
}: {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}) => {
  /* helpers */
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();

  /* local selection state */
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth()); // 0-based
  const [day, setDay] = useState(selectedDate.getDate());

  /* recompute days when month / year change */
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* keep day in range when switching to shorter months */
  useEffect(() => {
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth]);

  /* bubble selection up */
  useEffect(() => onDateChange(new Date(year, month, day)), [year, month, day]);

  /* styles */
  const s = StyleSheet.create({
    column: { flex: 1, marginHorizontal: 8 },
    label: {
      textAlign: "center",
      fontSize: 12,
      color: TXT_MUTED,
      marginBottom: 6,
      fontWeight: "500",
    },
    option: { paddingVertical: 8, borderRadius: 10, marginBottom: 4 },
    optTxt: { textAlign: "center", fontSize: 14 },
    scroller: { height: 150 },
  });

  /* generic number column */
  const renderNumberCol = (items: number[], value: number, setter: any) => (
    <ScrollView style={s.scroller} showsVerticalScrollIndicator={false}>
      {items.map((item) => {
        const active = value === item;
        return (
          <TouchableOpacity
            key={item.toString()}
            onPress={() => setter(item)}
            style={[
              s.option,
              { backgroundColor: active ? BRAND_GREEN : BG_DIM },
            ]}
          >
            <Text
              style={[
                s.optTxt,
                {
                  color: active ? "#ffffff" : TXT_PRIMARY,
                  fontWeight: active ? "600" : "400",
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  /* month column (needs index) */
  const renderMonthCol = () => (
    <ScrollView style={s.scroller} showsVerticalScrollIndicator={false}>
      {months.map((label, idx) => {
        const active = month === idx;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => setMonth(idx)}
            style={[
              s.option,
              { backgroundColor: active ? BRAND_GREEN : BG_DIM },
            ]}
          >
            <Text
              style={[
                s.optTxt,
                {
                  color: active ? "#ffffff" : TXT_PRIMARY,
                  fontWeight: active ? "600" : "400",
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View
      style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 8 }}
    >
      {/* Month */}
      <View style={s.column}>
        <Text style={s.label}>Month</Text>
        {renderMonthCol()}
      </View>

      {/* Day */}
      <View style={s.column}>
        <Text style={s.label}>Day</Text>
        {renderNumberCol(days, day, setDay)}
      </View>

      {/* Year */}
      <View style={s.column}>
        <Text style={s.label}>Year</Text>
        {renderNumberCol(years, year, setYear)}
      </View>
    </View>
  );
};

/* ────────────── main component ────────────── */
export default function BirthdayPicker({
  isBirthdayPickerVisible,
  onSelectDate,
  setIsBirthdayPickerVisible,
}: {
  isBirthdayPickerVisible: boolean;
  onSelectDate: (d: string) => void;
  setIsBirthdayPickerVisible: (v: boolean) => void;
}) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));

  /* slide-up / down */
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isBirthdayPickerVisible ? 0 : 500,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [isBirthdayPickerVisible]);

  /* native picker handler (Android) */
  const handleNative = (_: any, d?: Date) => {
    if (!d) return setIsBirthdayPickerVisible(false); // dismissed
    setTempDate(d);
    if (Platform.OS === "android") finish(d);
  };

  const finish = (d = tempDate) => {
    onSelectDate(d.toISOString().split("T")[0]);
    setIsBirthdayPickerVisible(false);
  };
  const cancel = () => setIsBirthdayPickerVisible(false);

  /* Android native picker: direct return */
  if (Platform.OS === "android" && DateTimePicker)
    return isBirthdayPickerVisible ? (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="calendar"
        onChange={handleNative}
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
      />
    ) : null;

  /* iOS / fallback modal */
  return (
    <Modal transparent visible={isBirthdayPickerVisible} animationType="fade">
      <TouchableWithoutFeedback onPress={cancel}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: BG_LIGHT,
                borderRadius: 20,
                paddingVertical: 16,
                width: "92%",
                maxWidth: 420,
                maxHeight: "82%",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              {/* header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                <TouchableOpacity onPress={cancel}>
                  <Text style={{ color: BRAND_GREEN, fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: TXT_PRIMARY,
                  }}
                >
                  Select Birthday
                </Text>
                <TouchableOpacity onPress={() => finish()}>
                  <Text
                    style={{
                      color: BRAND_GREEN,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* picker body */}
              {DateTimePicker && Platform.OS === "ios" ? (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleNative}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  textColor={TXT_PRIMARY as any}
                  style={{ height: 220 }}
                />
              ) : (
                <FallbackDatePicker
                  selectedDate={tempDate}
                  onDateChange={setTempDate}
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
