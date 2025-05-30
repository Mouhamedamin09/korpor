// app/main/components/profileScreens/profile/LiveChatScreen.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

import {
  fetchLiveChatAgents,
  fetchAccountData,
  LiveChatAgent,
} from "@main/services/api";

import Avatar from "@main/components/profileScreens/components/ui/Avatar";

const GUTTER = "px-6";
const CARD = "bg-surface border-border rounded-2xl shadow-sm";

// Enhanced Chatbot Avatar component
const ChatBotAvatar: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <View 
    className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-lg"
    style={{ width: size, height: size }}
  >
    <Text style={{ fontSize: size * 0.5 }}>🤖</Text>
  </View>
);

const LiveChatScreen: React.FC = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<LiveChatAgent[]>([]);
  const [name, setName] = useState("User");
  const [isReady, setIsReady] = useState(false);

  // Safe navigation helper
  const safeGoBack = () => {
    try {
      if (isReady && router && router.back && typeof router.back === 'function') {
        router.back();
      }
    } catch (error) {
      console.log('Navigation back error:', error);
    }
  };

  useEffect(() => {
    // Set ready state after a small delay to ensure navigation is initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    fetchLiveChatAgents().then(setAgents).catch(console.error);
    fetchAccountData().then((u) => setName(u.name.split(" ")[0])).catch(console.error);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Enhanced Header with Chatbot Design */}
      <LinearGradient
        colors={["#051026", "#0b1c46", "#1a2b5c"]}
        className="rounded-b-[36px] pb-8"
      >
        <View
          className={`${GUTTER} pt-12 flex-row items-center justify-between mb-6`}
        >
          <Text className="text-white text-3xl font-extrabold tracking-wide">
            korpor
          </Text>
          
          {/* Chatbot Logo */}
          <View className="relative">
            <Image source={require("@assets/chatbotW.png")} className="w-16 h-16 rounded-full" />
            {/* Online indicator */}
            <View className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-3 border-white items-center justify-center">
              <View className="w-3 h-3 bg-white rounded-full" />
            </View>
          </View>

          <TouchableOpacity 
            onPress={safeGoBack}
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
          >
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View className={`${GUTTER} mb-8`}>
          <Text className="text-white text-[28px] leading-9 font-bold mb-3">
            Hi {name}! 👋
          </Text>
          <Text className="text-white/85 text-lg leading-7">
            I'm your AI assistant. How can I help you today?
          </Text>
        </View>

     
       
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        <View className={`${GUTTER} mt-12`}>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-lg font-bold text-surfaceText">
              Recent Messages
            </Text>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-sm text-green-600 font-semibold">Online</Text>
            </View>
          </View>
          
          {/* Chatbot Conversation */}
          <TouchableOpacity className={`${CARD} p-8 flex-row items-center mb-8`}>
            <Image source={require("@assets/chatbot.png")} className="w-16 h-16 rounded-full" />
            <View className="flex-1 ml-6">
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-surfaceText text-lg">
                  Korpor Assistant
                </Text>
                <View className="ml-3 bg-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-600 text-xs font-bold">AI</Text>
                </View>
              </View>
              <Text className="text-mutedText text-base mb-3 leading-6">
                Hello! I'm here to help with your investment questions. How can I assist you today?
              </Text>
              <Text className="text-sm text-textGray font-medium">
                Active now
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>

         
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LiveChatScreen;
