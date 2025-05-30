// 🧾 Interfaces
export interface EmailInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export interface SolidButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface RememberMeCheckboxProps {
  disabled?: boolean;
}

// ✅ Component Exports
export { default as OutlinedButton } from "./outlinedButton";
export { default as OTPInput } from "./OTPInput";
export { default as SolidButtonLg } from "./solidButtonLg";
export { default as PasswordBarInput } from "./passwordBarInput";
export { default as EmailInput } from "./emailInput";
export { default as PhoneNumberInput } from "./phoneInput";
export { default as DateInput } from "./dateInput";
export { default as SolidButton } from "./solidButton";
export { default as GoogleButton } from "./googleButton";
export { default as DividerWithText } from "./dividerWithText";
export { default as Input } from "./textInput";
export { default as PasswordInput } from "./passwordInput";
export { default as RememberMeCheckbox } from "./rememberMe";
export { default as PressableText } from "./pressableText";
export { default as OutlinedButtonSm } from "./outlinedButtonSm";
