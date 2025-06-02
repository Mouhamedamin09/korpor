import { TouchableOpacity } from "react-native";
import React from "react";
import Feather from "react-native-vector-icons/Feather";

type Props = {
  onPress?: () => void;
};

export default function Bookmarks({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Feather name="bookmark" size={24} color="#000" />
    </TouchableOpacity>
  );
}
