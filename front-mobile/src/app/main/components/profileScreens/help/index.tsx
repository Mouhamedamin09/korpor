import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import {
  fetchHelpCollections,
  HelpCollection,
  searchArticles,
  SearchHit,
} from "@main/services/api";
import ListItemCount from "@main/components/profileScreens/components/ui/ListItemCount";

const HelpCollectionsScreen: React.FC = () => {
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [collections, setCollections] = useState<HelpCollection[]>([]);
  const [results, setResults] = useState<SearchHit[]>([]);

  /* load collections once */
  useEffect(() => {
    fetchHelpCollections().then(setCollections);
  }, []);

  /* debounced search */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        searchArticles(query).then(setResults);
      } else {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  /* helper to render bold snippet */
  const Snippet = ({ text }: { text: string }) => {
    const parts = text.split("**");
    return (
      <Text className="text-xs text-gray-500">
        {parts.map((p, i) =>
          i % 2 ? (
            <Text key={i} className="font-semibold text-black">
              {p}
            </Text>
          ) : (
            p
          )
        )}
      </Text>
    );
  };

  const filtered = collections.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* ───── header / search bar ───── */}
      {showSearch ? (
        <View className="bg-white border-b border-gray-200 py-3 px-4 flex-row items-center shadow-sm mb-4">
          <Feather name="search" size={20} color="gray" className="mr-2" />
          <TextInput
            placeholder="Search articles or collections…"
            value={query}
            onChangeText={setQuery}
            autoFocus
            className="flex-1 text-base"
          />
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setShowSearch(false);
              setResults([]);
            }}
          >
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200 shadow-sm mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Help</Text>
          <TouchableOpacity onPress={() => setShowSearch(true)}>
            <Feather name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {/* ───── results or collections ───── */}
      {showSearch && query.trim().length > 1 ? (
        results.map((r) => (
          <TouchableOpacity
            key={r.id}
            className="bg-white px-4 py-3 border-b border-gray-100"
            onPress={() => router.push(`/help/article/${r.id}`)}
          >
            <Text className="text-base text-black mb-1">{r.title}</Text>
            <Snippet text={r.snippet} />
          </TouchableOpacity>
        ))
      ) : (
        <>
          <View className="px-4 py-2">
            <Text className="text-sm text-gray-500">
              {collections.length} collections
            </Text>
          </View>
          {filtered.map((c) => (
            <ListItemCount
              key={c.id}
              label={c.label}
              count={c.articleIds.length}
              onPress={() => router.push(`/help/${c.id}`)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default HelpCollectionsScreen;
