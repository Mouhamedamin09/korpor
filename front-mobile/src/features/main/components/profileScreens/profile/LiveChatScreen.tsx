// app/main/components/profileScreens/profile/LiveChatScreen.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import {
  fetchLiveChatAgents,
  fetchAccountData,
  searchArticles,
  LiveChatAgent,
  SearchHit,
} from "@main/services/api";

import Avatar from "@main/components/profileScreens/components/ui/Avatar";
import SearchHitItem from "@main/components/profileScreens/components/ui/SearchHitItem";

const GUTTER = "px-6";
const CARD = "bg-surface border-border rounded-2xl shadow-sm";

const LiveChatScreen: React.FC = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<LiveChatAgent[]>([]);
  const [name, setName] = useState("User");
  const [tab, setTab] = useState<"msg" | "help">("msg");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);

  useEffect(() => {
    fetchLiveChatAgents().then(setAgents);
    fetchAccountData().then((u) => setName(u.name.split(" ")[0]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === "help" && q.trim().length > 1) {
        searchArticles(q).then(setHits);
      } else {
        setHits([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q, tab]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LinearGradient
        colors={["#051026", "#0b1c46"]}
        className="rounded-b-[36px] pb-12"
      >
        <View
          className={`${GUTTER} pt-12 flex-row items-center justify-between`}
        >
          <Text className="text-white text-3xl font-extrabold tracking-wide">
            korpor
          </Text>
          <View className="flex-row">
            {agents.slice(0, 2).map((a) => (
              <Avatar
                key={a.id}
                name={a.name}
                uri={a.avatar}
                size={30}
                extraStyle="mr-2"
              />
            ))}
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <View className={`${GUTTER} mt-10`}>
          <Text className="text-white text-[22px] leading-8 font-semibold">
            Hi {name}!{"\n"}How can we help?
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View className={`${GUTTER} mt-8`}>
          <View className="bg-mutedBg rounded-xl p-1 flex-row">
            <TouchableOpacity
              onPress={() => setTab("msg")}
              className={`flex-1 items-center py-3 rounded-lg ${
                tab === "msg" ? "bg-surface" : ""
              }`}
            >
              <Text
                className={
                  tab === "msg" ? "text-surfaceText" : "text-mutedText"
                }
              >
                Messages
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab("help")}
              className={`flex-1 items-center py-3 rounded-lg ${
                tab === "help" ? "bg-surface" : ""
              }`}
            >
              <Text
                className={
                  tab === "help" ? "text-surfaceText" : "text-mutedText"
                }
              >
                Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {tab === "msg" && (
          <View className={`${GUTTER} mt-10 space-y-4`}>
            <Text className="text-xs uppercase tracking-wider text-textGray">
              Recent message
            </Text>
            <TouchableOpacity className={`${CARD} p-5 flex-row`}>
              <Avatar
                name={agents[0]?.name || "A"}
                uri={agents[0]?.avatar}
                size={40}
                extraStyle="mr-4"
              />
              <View className="flex-1">
                <Text className="font-medium mb-1 text-surfaceText">
                  You: [GIF]
                </Text>
                <Text className="text-xs text-mutedText">
                  {agents[0]?.name.split(" ")[0]} · Just now
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        )}

        {tab === "help" && (
          <View className={`${GUTTER} mt-10 space-y-6`}>
            <View className={`${CARD} flex-row items-center px-4`}>
              <TextInput
                placeholder="Search help articles"
                value={q}
                onChangeText={setQ}
                className="flex-1 py-4 text-base text-surfaceText"
              />
              <Feather name="search" size={20} color="#000000" />
            </View>

            {hits.map((h) => (
              <SearchHitItem key={h.id} {...h} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LiveChatScreen;
