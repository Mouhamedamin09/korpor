import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchArticlesByCollection, HelpArticle } from "@main/services/api";
import ListItem from "@main/components/profileScreens/components/ui/ListItem";

const HelpArticlesScreen: React.FC = () => {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const router = useRouter();
  const [articles, setArticles] = useState<HelpArticle[]>([]);

  useEffect(() => {
    fetchArticlesByCollection(collectionId).then(setArticles);
  }, [collectionId]);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <TopBar title="Articles" onBackPress={() => router.back()} />

      {articles.map((a) => (
        <ListItem
          key={a.id}
          label={a.title}
          onPress={() => router.push(`/help/article/${a.id}`)}
        />
      ))}
    </ScrollView>
  );
};

export default HelpArticlesScreen;
