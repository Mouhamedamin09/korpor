import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

const DownArrow = require("@assets/down-arrow.png");
const Tunisia = require("@assets/tunisia.png");

const options = ["Available", "Funded", "Exited"];

export default function DropdownMenu() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState("Available");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    setVisible((prev) => !prev);
  };

  const closeDropdown = () => {
    setVisible(false);
  };

  const handleSelect = (item: string) => {
    setSelected(item);
    closeDropdown();
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
    <View className="w-64 relative">
      <TouchableOpacity
        className="flex-row border border-zinc-200 rounded-xl h-12 items-center justify-center px-4 bg-white"
        onPress={toggleDropdown}
        activeOpacity={0.85}
      >
        <Image
          className="w-5 h-5 mr-2"
          source={Tunisia}
          style={{ resizeMode: "contain" }}
        />
        <Text className="text-base text-zinc-500 mr-1">Properties:</Text>
        <Text className="text-base text-zinc-800">{selected}</Text>
        <Image className="w-5 h-5 ml-2" source={DownArrow} />
      </TouchableOpacity>

      {visible && (
        <>
          {/* Fullscreen backdrop */}
          <TouchableWithoutFeedback onPress={closeDropdown}>
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

          {/* Animated dropdown */}
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute top-14 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-20"
          >
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                className={`px-4 py-3 ${
                  selected === item ? "bg-zinc-100" : "bg-white"
                }`}
                onPress={() => handleSelect(item)}
              >
                <Text
                  className={`text-base ${
                    selected === item
                      ? "text-zinc-900 font-semibold"
                      : "text-zinc-700"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
}
