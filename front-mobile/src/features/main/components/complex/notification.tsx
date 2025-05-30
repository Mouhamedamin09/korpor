import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { NotificationItem } from "@/shared/types/notification";
import { router } from "expo-router";

const Plus = require("@assets/plus-hexagon.png");
const Check = require("@assets/hexagon-check.png");
const Dot = require("@assets/dot1.png");
const Exit = require("@assets/exit.png");
const Document = require("@assets/document1.png");
const Money = require("@assets/money.png");

interface Props {
  data: NotificationItem;
  show: "date" | "time"; // pick one to display
}

export default function Notification({ data, show }: Props) {
  const { description, datetime, read, type, propertyId, id } = data;

  const timeStr = datetime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = datetime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

  // Determine icon and title based on type
  let icon = Plus;
  let title = "Notification";

  switch (type) {
    case "new_property":
      icon = Plus;
      title = "New property alert";
      break;
    case "exit_window":
      icon = Exit;
      title = "Exit window alert";
      break;
    case "document":
      icon = Document;
      title = "Documents alert";
      break;
    case "funding":
      icon = Check;
      title = "Funding milestone alert";
      break;
    case "rent":
      icon = Money;
      title = "Rent alert";
      break;
  }

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "main/components/propertyScreens/[id]",
          params: { id: propertyId },
        });
        console.log(id + " read");
      }}
      className="bg-card w-[90%] self-center border border-border flex-row py-3 px-4 items-center mb-3 rounded-xl"
    >
      <View className="flex-1">
        <View className="flex-row">
          <Image
            source={icon}
            className="w-5 h-5"
            style={{ resizeMode: "contain" }}
          />
          <View className="w-2" />
          <View className="flex-row justify-between items-center w-[90%]">
            <View className="flex-row">
              <Text className="text-foreground font-bold">{title}</Text>
              {!read && (
                <Image source={Dot} className="w-3 h-3 self-center ml-1" />
              )}
            </View>
            <Text className="text-textGray font-semibold text-[13px]">
              {show === "time" ? timeStr : dateStr}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center w-[90%] mt-1">
          <View className="w-8" />
          <Text className="text-muted-foreground text-sm">
            {description.slice(0, 100)}
            {description.length > 100 && "..."}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
