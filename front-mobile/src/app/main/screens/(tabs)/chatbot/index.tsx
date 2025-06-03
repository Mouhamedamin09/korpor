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
import { LinearGradient } from "expo-linear-gradient";
import TypingIndicator from "../../../../auth/components/ui/TypingIndicator";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Separate component for message bubbles to avoid hooks in render function
const MessageBubble = ({ message }: { message: Message }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`mb-4 px-5  ${message.isUser ? "items-end" : "items-start"}`}
    >
      {message.isUser ? (
        <LinearGradient
          colors={["#34d399", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-5 py-4 rounded-3xl rounded-br-md shadow-lg"
          style={{
            borderRadius: 20,
          }}
        >
          <Text className="text-white text-[16px] leading-[22px] font-medium">
            {message.text}
          </Text>
        </LinearGradient>
      ) : (
        <View className="max-w-[85%] bg-white px-5 py-4 rounded-3xl rounded-bl-md shadow-md border border-gray-100">
          <Text className="text-gray-800 text-[16px] leading-[22px]">
            {message.text}
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

  const renderTypingIndicator = () => (
    <View className="mb-4 px-5 items-start">
      <View className="bg-white px-5 py-4 rounded-3xl rounded-bl-md shadow-md border border-gray-100">
        <TypingIndicator />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#34d399", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6"
      >
        <SafeAreaView edges={["top"]}>
          <View className="px-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 backdrop-blur rounded-full items-center justify-center mr-4 shadow-lg">
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-[20px] font-bold">
                  AI Assistant
                </Text>
                <Text className="text-white/80 text-[14px]">
                  Real Estate Investment Expert
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 pt-6 "
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && renderTypingIndicator()}
          <View className="h-10" />
        </ScrollView>

        {/* Enhanced Input Area */}
        <View className="px-5 py-4 bg-white border-t border-gray-200">
          <View className="flex-row items-end space-x-3">
            <View className="flex-1 bg-gray-100 rounded-3xl px-5 py-4 min-h-[48px] justify-center shadow-sm">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                className="text-[16px] text-gray-800 leading-[22px]"
                style={{ maxHeight: 100 }}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={inputText.trim() === ""}
              className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
            >
              <LinearGradient
                colors={
                  inputText.trim() === ""
                    ? ["#D1D5DB", "#9CA3AF"]
                    : ["#667eea", "#764ba2"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-12 h-12 rounded-full items-center justify-center ml-4"
                style={{
                  borderRadius: 20,
                }}
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
