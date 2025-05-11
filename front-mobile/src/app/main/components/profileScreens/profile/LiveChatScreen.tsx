// app/main/components/profileScreens/profile/LiveChatScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
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

/* ───── constants ───── */
const GUTTER = "px-6"; // base horizontal padding
const CARD = "bg-white rounded-2xl border border-gray-100 shadow-sm";
const TAB = "flex-1 items-center py-3 rounded-lg";

/* ───── component ───── */
const LiveChatScreen: React.FC = () => {
  const router = useRouter();
  const [agents, setA] = useState<LiveChatAgent[]>([]);
  const [name, setN] = useState("User");
  const [tab, setTab] = useState<"msg" | "help">("msg");
  const [q, setQ] = useState("");
  const [hits, setHit] = useState<SearchHit[]>([]);

  /* load */
  useEffect(() => {
    fetchLiveChatAgents().then(setA);
    fetchAccountData().then((u) => setN(u.name.split(" ")[0]));
  }, []);

  /* search debounce */
  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === "help" && q.trim().length > 1) searchArticles(q).then(setHit);
      else setHit([]);
    }, 250);
    return () => clearTimeout(t);
  }, [q, tab]);

  /* ui */
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ═════ header ═════ */}
      <LinearGradient
        colors={["#051026", "#0b1c46"]}
        className="rounded-b-[36px] pb-12"
      >
        {/* top-bar */}
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

        {/* greeting */}
        <View className={`${GUTTER} mt-10`}>
          <Text className="text-white text-[22px] leading-8 font-semibold">
            Hi {name}!{"\n"}How can we help?
          </Text>
        </View>
      </LinearGradient>

      {/* ═════ body ═════ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* tabs */}
        <View className={`${GUTTER} mt-8`}>
          <View className="bg-gray-100 rounded-xl p-1 flex-row">
            <TouchableOpacity
              onPress={() => setTab("msg")}
              className={`${TAB} ${tab === "msg" ? "bg-white" : ""}`}
            >
              <Text
                className={tab === "msg" ? "text-gray-900" : "text-gray-500"}
              >
                Messages
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab("help")}
              className={`${TAB} ${tab === "help" ? "bg-white" : ""}`}
            >
              <Text
                className={tab === "help" ? "text-gray-900" : "text-gray-500"}
              >
                Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* messages */}
        {tab === "msg" && (
          <View className={`${GUTTER} mt-10 space-y-4`}>
            <Text className="text-xs uppercase tracking-wider text-gray-400">
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
                <Text className="font-medium mb-1 text-gray-900">
                  You: [GIF]
                </Text>
                <Text className="text-xs text-gray-500">
                  {agents[0]?.name.split(" ")[0]} · Just now
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {/* help */}
        {tab === "help" && (
          <View className={`${GUTTER} mt-10 space-y-6`}>
            {/* search box */}
            <View className={`${CARD} flex-row items-center px-4`}>
              <TextInput
                placeholder="Search help articles"
                value={q}
                onChangeText={setQ}
                className="flex-1 py-4 text-base"
              />
              <Feather name="search" size={20} color="#000" />
            </View>

            {/* results */}
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
