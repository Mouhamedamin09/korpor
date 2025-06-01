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

export type DropdownOption = string;

interface Props {
  options: DropdownOption[];
  selected: DropdownOption;
  onChange: (o: DropdownOption) => void;
  width?: number | string;
}

const DropdownMenu: React.FC<Props> = ({
  options,
  selected,
  onChange,
  width = 96,
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => setVisible((v) => !v);
  const close = () => setVisible(false);

  const choose = (o: DropdownOption) => {
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

  return (
    <View style={{ width }} className="relative">
      <TouchableOpacity
        className="flex-row border border-zinc-200 rounded-xl h-10 items-center justify-center px-4 bg-white"
        onPress={toggle}
        activeOpacity={0.85}
      >
        <Text className="text-base text-zinc-800">{selected}</Text>
        <Image source={DownArrow} className="w-5 h-5 ml-2" />
      </TouchableOpacity>

      {visible && (
        <>
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
};

export default DropdownMenu;
