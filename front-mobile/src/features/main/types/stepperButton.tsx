// types/button.ts
import { GestureResponderEvent } from "react-native";

export type ButtonPressHandler = (event: GestureResponderEvent) => void;

export type IconButtonProps = {
  onPress: ButtonPressHandler;
};
