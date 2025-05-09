import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import {
  Notification,
  AdjustableHeader,
  NotificationSkeleton,
} from "@main/components/complex/index";
import type { NotificationItem } from "@/shared/types/notification";

type Option = "All" | "Unread";

const sampleNotifications: NotificationItem[] = [
  {
    id: 1,
    description: "New listing: 3‑bed apartment in Berlin",
    datetime: new Date("2025-05-08T19:45:00"),
    read: false,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 2,
    description: "Your KYC document has been approved.",
    datetime: new Date("2025-05-07T09:15:00"),
    read: true,
    type: "funding",
    propertyId: 1,
  },
  {
    id: 3,
    description: "Price drop on your watched property in Hamburg.",
    datetime: new Date("2025-05-06T13:22:00"),
    read: false,
    type: "rent",
    propertyId: 1,
  },
  {
    id: 4,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-05T18:05:00"),
    read: true,
    type: "exit_window",
    propertyId: 1,
  },
  {
    id: 5,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-08T18:05:00"),
    read: true,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 6,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-05T18:05:00"),
    read: true,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 7,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-05T18:05:00"),
    read: true,
    type: "document",
    propertyId: 1,
  },
  {
    id: 8,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-05T18:05:00"),
    read: true,
    type: "funding",
    propertyId: 1,
  },
  {
    id: 9,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-08T18:05:00"),
    read: true,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 10,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-04-05T18:05:00"),
    read: true,
    type: "exit_window",
    propertyId: 1,
  },
  {
    id: 11,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-05-05T18:05:00"),
    read: true,
    type: "rent",
    propertyId: 1,
  },
  {
    id: 12,
    description: "New property: Modern loft in Munich.",
    datetime: new Date("2025-02-05T18:05:00"),
    read: false,
    type: "document",
    propertyId: 1,
  },
];
const isSameDay = (d1: Date, d2: Date) =>
  d1.toDateString() === d2.toDateString();
const msInDay = 86_400_000;

export default function NotificationsMenu() {
  const [selectedCategory, setSelectedCategory] = useState<Option>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000); // 3s delay
    return () => clearTimeout(timeout);
  }, []);

  const filtered = useMemo(() => {
    return selectedCategory === "Unread"
      ? sampleNotifications.filter((n) => !n.read)
      : sampleNotifications;
  }, [selectedCategory]);

  const { today, week, earlier } = useMemo(() => {
    const todayArr: NotificationItem[] = [];
    const weekArr: NotificationItem[] = [];
    const earlierArr: NotificationItem[] = [];

    const now = new Date();

    [...filtered]
      .sort((a, b) => b.datetime.getTime() - a.datetime.getTime())
      .forEach((n) => {
        if (isSameDay(now, n.datetime)) {
          todayArr.push(n);
        } else if (now.getTime() - n.datetime.getTime() < 7 * msInDay) {
          weekArr.push(n);
        } else {
          earlierArr.push(n);
        }
      });

    return { today: todayArr, week: weekArr, earlier: earlierArr };
  }, [filtered]);

  const renderGroup = (
    title: string,
    list: NotificationItem[],
    show: "date" | "time"
  ) =>
    list.length > 0 && (
      <>
        <Text className="mx-4 mb-1 text-textGray">{title}</Text>
        {list.map((n) => (
          <Notification key={n.id} data={n} show={show} />
        ))}
      </>
    );

  return (
    <View className="bg-primary-foreground flex-1">
      <View style={{ zIndex: 20, position: "relative" }}>
        <AdjustableHeader
          selectedCategory={selectedCategory}
          onChangeCategory={setSelectedCategory}
        />
      </View>

      <View style={{ zIndex: 1, flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            [...Array(6)].map((_, i) => <NotificationSkeleton key={i} />)
          ) : (
            <>
              <TouchableOpacity className="self-end mr-6 p-1">
                <Text className="text-primary font-semibold">
                  Mark All as Read
                </Text>
              </TouchableOpacity>
              {renderGroup("Today", today, "time")}
              {renderGroup("This week", week, "date")}
              {renderGroup("Earlier", earlier, "date")}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
