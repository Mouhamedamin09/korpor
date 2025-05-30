import React from "react";
import { Image, View, Text } from "react-native";

interface Props {
  size?: number; // px, default 32
  name: string; // used for initials fallback
  uri?: string | undefined;
  extraStyle?: string; // tailwind classes
}

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Avatar: React.FC<Props> = ({ size = 32, name, uri, extraStyle }) => {
  if (uri)
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        className={`rounded-full ${extraStyle || ""}`}
      />
    );

  return (
    <View
      style={{ width: size, height: size }}
      className={`rounded-full bg-emerald-600 items-center justify-center ${
        extraStyle || ""
      }`}
    >
      <Text
        style={{ fontSize: size / 2.3 }}
        className="font-semibold text-white"
      >
        {initials(name)}
      </Text>
    </View>
  );
};

export default Avatar;
