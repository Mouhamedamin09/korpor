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

// Export all components
export { default as EmailInput } from './emailInput';
export { default as PasswordInput } from './passwordInput';
export { default as SolidButton } from './solidButton';
export { default as GoogleButton } from './googleButton';
export { default as DividerWithText } from './dividerWithText';
export { default as RememberMeCheckbox } from './rememberMe';
export { default as PressableText } from './pressableText'; 