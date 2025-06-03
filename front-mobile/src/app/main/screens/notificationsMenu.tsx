import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  Notification,
  NotificationSkeleton,
} from "@main/components/complex/index";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import type { NotificationItem } from "@/shared/types/notification";

type Option = "All" | "Unread";

/* ────────────── mock data (3 welcome items) ────────────── */
const sampleNotifications: NotificationItem[] = [
  {
    id: 1,
    description: "🎉 Welcome to Korpor! Explore your first investment today.",
    datetime: new Date(), // now
    read: false,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 2,
    description: "👋 Hi there! Complete your profile to unlock full features.",
    datetime: new Date(Date.now() - 60 * 60 * 1000), // 1 h ago
    read: false,
    type: "new_property",
    propertyId: 1,
  },
  {
    id: 3,
    description:
      "📚 Tips: Check out our beginner's guide to real-estate investing.",
    datetime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 h ago
    read: false,
    type: "new_property",
    propertyId: 1,
  },
];

const isSameDay = (d1: Date, d2: Date) =>
  d1.toDateString() === d2.toDateString();
const msInDay = 86_400_000;

export default function NotificationsMenu() {
  const [selectedCategory, setSelectedCategory] = useState<Option>("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const filtered = useMemo(
    () =>
      selectedCategory === "Unread"
        ? sampleNotifications.filter((n) => !n.read)
        : sampleNotifications,
    [selectedCategory]
  );

  const { today, week, earlier } = useMemo(() => {
    const todayArr: NotificationItem[] = [];
    const weekArr: NotificationItem[] = [];
    const earlierArr: NotificationItem[] = [];
    const now = new Date();

    [...filtered]
      .sort((a, b) => b.datetime.getTime() - a.datetime.getTime())
      .forEach((n) => {
        if (isSameDay(now, n.datetime)) todayArr.push(n);
        else if (now.getTime() - n.datetime.getTime() < 7 * msInDay)
          weekArr.push(n);
        else earlierArr.push(n);
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

  // Category selector component for TopBar rightComponent
  const CategorySelector = () => (
    <View className="flex-row bg-gray-100 rounded-lg p-1">
      {(["All", "Unread"] as Option[]).map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelectedCategory(option)}
          className={`px-3 py-1 rounded-md ${
            selectedCategory === option
              ? "bg-white shadow-sm"
              : "bg-transparent"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              selectedCategory === option ? "text-gray-900" : "text-gray-600"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="bg-primary-foreground flex-1">
      <TopBar
        title="Notifications"
        onBackPress={() => router.back()}
        rightComponent={<CategorySelector />}
      />

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
