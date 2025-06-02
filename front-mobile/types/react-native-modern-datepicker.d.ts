declare module "react-native-modern-datepicker" {
  import { Component } from "react";
  import { ViewStyle } from "react-native";

  interface DatePickerOptions {
    backgroundColor?: string;
    textHeaderColor?: string;
    textDefaultColor?: string;
    selectedTextColor?: string;
    mainColor?: string;
    textSecondaryColor?: string;
    borderColor?: string;
  }

  interface DatePickerProps {
    onSelectedChange?: (date: string) => void;
    mode?: "calendar" | "monthYear" | "time";
    style?: ViewStyle;
    options?: DatePickerOptions;
    current?: string;
    selected?: string;
    minimumDate?: string;
    maximumDate?: string;
  }

  export default class DatePicker extends Component<DatePickerProps> {}
}
