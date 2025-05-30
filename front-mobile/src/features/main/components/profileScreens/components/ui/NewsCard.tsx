import React, { useState } from "react";
import { Image, Pressable, View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Card from "./card";

interface NewsCardProps {
  imageUrl: string;
  date: string;
  title: string;
  onPress?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  imageUrl,
  date,
  title,
  onPress,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <Pressable onPress={onPress} android_ripple={{ color: "#e5e5e5" }}>
      <Card extraStyle="w-64 h-72 mr-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black">
        {/* Image (fixed height) */}
        <View className="w-full h-36 bg-zinc-200 dark:bg-zinc-700 relative">
          {!failed ? (
            <Image
              source={{ uri: imageUrl }}
              onError={() => setFailed(true)}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="absolute inset-0 flex items-center justify-center">
              <Feather name="image-off" size={24} color="#999" />
            </View>
          )}
        </View>

        {/* Metadata */}
        <View className="px-4 py-3" style={{ minHeight: 0 }}>
          <Text className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {date}
          </Text>

          <Text
            numberOfLines={3}
            className="mt-1 text-base font-semibold leading-5 text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </Text>

          <Text className="mt-3 text-sm font-bold text-green-600">
            Read more...
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};

export default NewsCard;
