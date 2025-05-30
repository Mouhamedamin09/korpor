import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchArticle, HelpArticle } from "@main/services/api";

const HelpArticleScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<HelpArticle | undefined>(undefined);

  useEffect(() => {
    fetchArticle(id).then(setArticle);
  }, [id]);

  if (!article)
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text>Loading…</Text>
      </View>
    );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with X */}
      <View className="bg-white border-b border-gray-200 py-4 px-4 flex-row items-center shadow-sm mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-black">{article.title}</Text>
      </View>

      {/* Author block */}
      <View className="px-4 flex-row items-center mb-4">
        <Image
          source={require("@assets/khalil.png")} // demo avatar
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="text-lg font-bold text-black">
            {article.author.name}
          </Text>
          <Text className="text-sm text-black">Updated {article.updated}</Text>
        </View>
      </View>

      {/* Body with basic markdown bold parser */}
      <View className="px-4 pb-8 flex-row flex-wrap">
        {article.body.split(/(\*\*.*?\*\*)/g).map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <Text key={index} className="text-lg font-bold text-black">
                {part.slice(2, -2)}
              </Text>
            );
          } else {
            return (
              <Text key={index} className="text-lg text-black">
                {part}
              </Text>
            );
          }
        })}
      </View>
    </ScrollView>
  );
};

export default HelpArticleScreen;
