import { Image, TouchableOpacity } from "react-native";
import React from "react";

const Bookmark = require("@assets/bookmark.png");

type Props = {
  onPress?: () => void;
};

export default function Bookmarks({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Image className="w-6 h-6" source={Bookmark} />
    </TouchableOpacity>
  );
}
