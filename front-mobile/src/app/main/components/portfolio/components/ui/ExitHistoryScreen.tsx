import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import { ExitHistoryCard, ExitHistorySkeleton } from "./index";
import { fetchExitHistory, ExitHistory } from "@main/services/exits";

const ExitHistoryScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exitData, setExitData] = useState<ExitHistory[]>([]);

  useEffect(() => {
    fetchExitHistory().then((data) => {
      setExitData(data);
      setLoading(false);
    });
  }, []);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <TopBar title="Exit History" onBackPress={() => router.back()} />
      <ScrollView className="p-4">
        {loading ? (
          <>
            <ExitHistorySkeleton />
            <ExitHistorySkeleton />
            <ExitHistorySkeleton />
          </>
        ) : exitData.length > 0 ? (
          exitData.map(({ id, ...item }) => (
            <ExitHistoryCard key={id} {...item} />
          ))
        ) : (
          <View className="items-center mt-20 px-8">
            <Feather name="archive" size={40} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-700 mt-4">
              Well... this is awkward.
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              You haven’t exited any investments yet.{"\n"}
              Either you're really patient, or you just like commitment.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExitHistoryScreen;
