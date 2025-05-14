// screens/HelpCollectionsScreen.tsx
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  TopBar,
  ListItem,
} from "@main/components/profileScreens/components/ui";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

const LearnHelp: React.FC = () => {
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ScrollView className="flex-1 bg-background">
      {isSearchActive ? (
        <View className="bg-surface border-b border-border py-3 px-4 flex-row items-center shadow-sm mb-4">
          <Feather name="search" size={20} color="#71717a" className="mr-2" />
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            className="flex-1 text-base text-surfaceText"
          />
          <TouchableOpacity
            onPress={() => {
              setIsSearchActive(false);
              setSearchQuery("");
            }}
          >
            <Feather name="x" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      ) : (
        <TopBar
          title="Returns"
          onBackPress={() => router.back()}
          rightComponent={
            <TouchableOpacity onPress={() => setIsSearchActive(true)}>
              <Feather name="search" size={24} color="#000000" />
            </TouchableOpacity>
          }
        />
      )}

      {!isSearchActive && (
        <View>
          <View className="px-4 py-4">
            <Text className="text-base font-medium text-surfaceText">
              How do I make money?
            </Text>
            <Text className="text-sm text-mutedText mt-1">
              5 articles by Ahmed jaziri
            </Text>
          </View>

          <ListItem
            label="How do returns work?"
            onPress={() => console.log("How do returns work?")}
          />
          <ListItem
            label="How will I earn my return on Stake?"
            onPress={() => console.log("How will I earn my return on Stake?")}
          />
          <ListItem
            label="What returns can I expect?"
            onPress={() => console.log("What returns can I expect?")}
          />
          <ListItem
            label="How will I know what my investment is worth?"
            onPress={() =>
              console.log("How will I know what my investment’s value?")
            }
          />
          <ListItem
            label="Do I earn any interest on my TDN wallet balance?"
            onPress={() => console.log("Interest on AED wallet balance?")}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default LearnHelp;
