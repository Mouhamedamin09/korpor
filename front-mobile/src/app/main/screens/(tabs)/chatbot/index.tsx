// app/chat/ChatbotScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import TypingIndicator from "../../../../auth/components/ui/TypingIndicator";
import { ChatbotApiService } from "./api/chatbotApi";

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                         */
/* -------------------------------------------------------------------------- */
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "What **legal requirements** apply to real-estate development in Tunisia?",
  "Main **challenges** real-estate developers face in Tunisia",
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const renderFormattedText = (txt: string) => {
  const parts = txt.split(/(\*\*[^\*]+\*\*)/);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <Text key={i} style={{ fontWeight: "700" }}>
        {p.slice(2, -2)}
      </Text>
    ) : (
      <Text key={i}>{p}</Text>
    )
  );
};

/* -------------------------------------------------------------------------- */
/*  UI sub-components                                                         */
/* -------------------------------------------------------------------------- */
const MessageBubble = ({ message }: { message: Message }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bubbleBase = "px-5 py-4 shadow-lg max-w-[85%] border border-white/10";
  const container =
    (message.isUser ? "items-end" : "items-start") + " mb-4 px-5";

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
      className={container}
    >
      {message.isUser ? (
        <LinearGradient
          colors={["#34d399", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={bubbleBase}
          style={{ borderRadius: 24, borderBottomRightRadius: 6 }}
        >
          <Text className="text-white text-[16px] leading-[22px] font-medium">
            {renderFormattedText(message.text)}
          </Text>
        </LinearGradient>
      ) : (
        <View
          className={bubbleBase + " bg-white"}
          style={{ borderRadius: 24, borderBottomLeftRadius: 6 }}
        >
          <Text className="text-gray-800 text-[16px] leading-[22px]">
            {renderFormattedText(message.text)}
          </Text>
        </View>
      )}

      <Text
        className={`text-xs text-gray-400 mt-1 ${
          message.isUser ? "mr-2" : "ml-2"
        }`}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Animated.View>
  );
};

const SuggestedPrompts = ({ onSelect }: { onSelect: (p: string) => void }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
      className="flex-row flex-wrap px-5 pt-4 pb-2 gap-3"
    >
      {SUGGESTED_PROMPTS.map((prompt) => (
        <TouchableOpacity
          key={prompt}
          activeOpacity={0.85}
          className="flex-shrink"
          onPress={() => onSelect(prompt.replace(/\*\*/g, ""))}
        >
          {/* gradient ring */}
          <LinearGradient
            colors={["#fde68a", "#f59e0b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.roundFull, { padding: 2 }]}
          >
            {/* chip */}
            <View
              className="flex-row items-center bg-white px-4 py-2 shadow-sm"
              style={styles.roundFull}
            >
              <Ionicons name="sparkles" size={16} color="#f59e0b" />
              <Text className="ml-2 text-[14px] font-medium text-gray-800">
                {renderFormattedText(prompt)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */
export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant for **real-estate investments**. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollView = useRef<ScrollView>(null);

  /* ------------------------------ lifecycle ------------------------------ */
  useEffect(() => {
    checkApiConnection();
    console.log("🔧 Chatbot API URL:", ChatbotApiService.getApiUrl());
  }, []);

  /* ------------------------------- helpers ------------------------------- */
  const checkApiConnection = async () => {
    const ok = await ChatbotApiService.checkHealth();
    setIsConnected(ok);

    if (!ok)
      Alert.alert(
        "Connection Issue",
        `Cannot reach the chatbot service at ${ChatbotApiService.getApiUrl()}.`,
        [{ text: "OK" }]
      );
  };

  const sendMessage = async (override?: string) => {
    const text = (override ?? inputText.trim()).replace(/\*\*/g, "");
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInputText("");
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      console.log("🚀 About to call ChatbotApiService.sendMessage with:", text);
      const botReply = await ChatbotApiService.sendMessage(text, false);
      console.log("✅ Got bot reply:", botReply, "Type:", typeof botReply);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          text: botReply,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I’m having trouble right now. Try again later.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(
        () => scrollView.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  };

  const Typing = () => (
    <View className="mb-4 px-5 items-start">
      <View
        className="bg-white px-5 py-4 shadow-md border border-gray-100"
        style={{ borderRadius: 24, borderBottomLeftRadius: 6 }}
      >
        <TypingIndicator />
      </View>
    </View>
  );

  /* -------------------------------- render ------------------------------- */
  return (
    <View className="flex-1 bg-gray-50">
      {/* header */}
      <LinearGradient
        colors={["#34d399", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6"
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6">
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 bg-white/20 backdrop-blur items-center justify-center mr-4 shadow-lg"
                style={styles.round24}
              >
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-[20px] font-bold">
                  AI Assistant
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-white/80 text-[14px]">
                    Real-Estate Investment Expert
                  </Text>
                  {isConnected !== null && (
                    <View className="ml-2 flex-row items-center">
                      <View
                        className={`w-2 h-2 rounded-full mr-1 ${
                          isConnected ? "bg-green-400" : "bg-red-400"
                        }`}
                        style={styles.roundFull}
                      />
                      <Text className="text-white/70 text-[12px]">
                        {isConnected ? "Connected" : "Offline"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {isConnected === false && (
                <TouchableOpacity
                  onPress={checkApiConnection}
                  className="bg-white/20 p-2"
                  style={styles.roundFull}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollView}
          className="flex-1 pt-6"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollView.current?.scrollToEnd({ animated: true })
          }
        >
          {showSuggestions && <SuggestedPrompts onSelect={sendMessage} />}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isTyping && <Typing />}
          <View className="h-10" />
        </ScrollView>

        {/* input bar */}
        <View className="px-5 py-4 bg-white border-t border-gray-200">
          <View className="flex-row items-end space-x-3">
            <View
              className="flex-1 bg-gray-100 px-5 py-4 min-h-[48px] justify-center shadow-sm"
              style={{ borderRadius: 24 }}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message…"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                className="text-[16px] text-gray-800 leading-[22px]"
                style={{ maxHeight: 100 }}
              />
            </View>

            {/* send button */}
            <TouchableOpacity
              disabled={!inputText.trim() || isTyping}
              onPress={() => sendMessage()}
              className="w-12 h-12 items-center justify-center shadow-lg ml-2"
              style={styles.round24}
            >
              <LinearGradient
                colors={
                  !inputText.trim() || isTyping
                    ? ["#D1D5DB", "#9CA3AF"]
                    : ["#667eea", "#764ba2"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.round24,
                  {
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Ionicons name="arrow-up" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  round24: { borderRadius: 24 },
  roundFull: { borderRadius: 9999 },
});
