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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TypingIndicator from "../../../../auth/components/ui/TypingIndicator";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant for real estate investments. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getBotResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("properties") || lowerText.includes("property")) {
      return "I can help you find properties! What type are you looking for - residential, commercial, or investment properties? And do you have a preferred location or budget range?";
    } else if (lowerText.includes("market") || lowerText.includes("analysis")) {
      return "The real estate market is showing interesting trends. Property values have grown 8% this quarter. Would you like insights for a specific area or property type?";
    } else if (
      lowerText.includes("roi") ||
      lowerText.includes("calculator") ||
      lowerText.includes("calculate")
    ) {
      return "I can help calculate your potential returns. I'll need the property price, expected rental income, and your investment timeline. What's the property you're considering?";
    } else if (
      lowerText.includes("help") ||
      lowerText.includes("hi") ||
      lowerText.includes("hello")
    ) {
      return "I'm here to help with your real estate investments! I can assist with property search, market analysis, ROI calculations, and investment advice. What interests you most?";
    } else {
      const responses = [
        "That's a great question! Could you provide more details so I can give you the best advice?",
        "I'd be happy to help with that. What specific information are you looking for?",
        "Interesting! Let me help you explore that further. What's your main goal here?",
        "I can definitely assist with that. Tell me more about what you have in mind.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={message.id}
        style={{ opacity: fadeAnim }}
        className={`mb-3 px-4 ${message.isUser ? "items-end" : "items-start"}`}
      >
        <View
          className={`max-w-[85%] px-4 py-3 rounded-3xl ${
            message.isUser
              ? "bg-[#007AFF] rounded-br-lg"
              : "bg-[#F2F2F7] rounded-bl-lg"
          }`}
        >
          <Text
            className={`text-[16px] leading-[22px] ${
              message.isUser ? "text-white" : "text-[#1C1C1E]"
            }`}
          >
            {message.text}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => (
    <View className="mb-3 px-4 items-start">
      <View className="bg-[#F2F2F7] px-4 py-3 rounded-3xl rounded-bl-lg">
        <TypingIndicator />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Simple Header */}
      <View className="px-4 py-3 border-b border-[#E5E5EA]">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-[#007AFF] rounded-full items-center justify-center mr-3">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <Text className="text-[#1C1C1E] text-[17px] font-semibold">
            AI Assistant
          </Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message, index) => renderMessage(message, index))}
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 bg-white border-t border-[#E5E5EA]">
          <View className="flex-row items-end space-x-3">
            <View className="flex-1 bg-[#F2F2F7] rounded-3xl px-4 py-3 min-h-[44px] justify-center">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message"
                placeholderTextColor="#8E8E93"
                multiline
                maxLength={1000}
                className="text-[16px] text-[#1C1C1E] leading-[22px]"
                style={{ maxHeight: 100 }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={inputText.trim() === ""}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                inputText.trim() === "" ? "bg-[#C7C7CC]" : "bg-[#007AFF]"
              }`}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
