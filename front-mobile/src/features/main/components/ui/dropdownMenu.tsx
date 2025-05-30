import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native";

const DownArrow = require("@assets/down-arrow.png");
const Tunisia = require("@assets/tunisia.png");

const options = ["Available", "Funded", "Exited"] as const;
type Option = (typeof options)[number];

interface Props {
  selected: Option;
  onChange: (o: Option) => void;
}

export default function DropdownMenu({ selected, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- open / close ---------- */
  const toggle = () => setVisible((v) => !v);
  const close = () => setVisible(false);

  const choose = (o: Option) => {
    onChange(o);
    close();
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  /* ---------- render ---------- */
  return (
    <View className="w-64 relative">
      <TouchableOpacity
        className="flex-row border border-zinc-200 rounded-xl h-12 items-center justify-center px-4 bg-white"
        onPress={toggle}
        activeOpacity={0.85}
      >
        <Image
          source={Tunisia}
          className="w-5 h-5 mr-2"
          style={{ resizeMode: "contain" }}
        />
        <Text className="text-base text-zinc-500 mr-1">Properties:</Text>
        <Text className="text-base text-zinc-800">{selected}</Text>
        <Image source={DownArrow} className="w-5 h-5 ml-2" />
      </TouchableOpacity>

      {visible && (
        <>
          {/* Back-drop */}
          <TouchableWithoutFeedback onPress={close}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: -1000,
                right: -1000,
                bottom: -1000,
                zIndex: 10,
              }}
            />
          </TouchableWithoutFeedback>

          {/* Drop-down */}
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute top-14 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-20"
          >
            {options.map((o) => (
              <TouchableOpacity
                key={o}
                onPress={() => choose(o)}
                className={`px-4 py-3 ${
                  selected === o ? "bg-zinc-100" : "bg-white"
                }`}
              >
                <Text
                  className={`text-base ${
                    selected === o
                      ? "text-zinc-900 font-semibold"
                      : "text-zinc-700"
                  }`}
                >
                  {o}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}
