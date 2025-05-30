import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  id: string;
  title: string;
  snippet: string; // markdown-style **bold**
}

const Snippet = ({ text }: { text: string }) =>
  text.split("**").map((p, i) =>
    i % 2 ? (
      <Text key={i} className="font-semibold text-black">
        {p}
      </Text>
    ) : (
      p
    )
  );

const SearchHitItem: React.FC<Props> = ({ id, title, snippet }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/help/article/${id}`)}
      className="bg-white px-4 py-3 border-b border-gray-100"
    >
      <Text className="text-base text-black mb-1">{title}</Text>
      <Text className="text-xs text-gray-500">
        <Snippet text={snippet} />
      </Text>
    </TouchableOpacity>
  );
};

export default SearchHitItem;
