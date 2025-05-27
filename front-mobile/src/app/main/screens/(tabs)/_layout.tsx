import { Tabs } from "expo-router";
import { Text, Pressable, Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName = "";
          let label = "";

          switch (route.name) {
            case "properties/index":
              iconName = focused ? "home" : "home-outline";
              label = "Properties";
              break;
            case "wallet/index":
              iconName = focused ? "wallet" : "wallet-outline";
              label = "Wallet";
              break;
            case "portfolio/index":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              label = "Portfolio";
              break;
            case "chatbot/index":
              iconName = focused ? "chatbox" : "chatbox-outline";
              label = "Chatbot";
              break;
            case "profile/index":
              iconName = focused ? "person" : "person-outline";
              label = "Profile";
              break;
          }

          return (
            <View className="items-center justify-center w-20">
              <Ionicons name={iconName as any} size={20} color={color} />
              <Text
                className={`text-xs mt-1 text-center max-w-[100px] ${
                  focused ? "text-black font-semibold" : "text-gray-400"
                }`}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        },
        tabBarButton: (props) => {
          const scale = useRef(new Animated.Value(1)).current;

          return (
            <Pressable
              onPressIn={() => {
                Animated.spring(scale, {
                  toValue: 0.97,
                  useNativeDriver: true,
                  speed: 20,
                  bounciness: 6,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(scale, {
                  toValue: 1,
                  useNativeDriver: true,
                  speed: 20,
                  bounciness: 6,
                }).start();
              }}
              onPress={props.onPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                {props.children}
              </Animated.View>
            </Pressable>
          );
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingBottom: 6,
          height: 60,
        },
      })}
    >
      <Tabs.Screen name="properties/index" options={{ title: "Properties" }} />
      <Tabs.Screen name="wallet/index" options={{ title: "Wallet" }} />
      <Tabs.Screen name="portfolio/index" options={{ title: "Portfolio" }} />
      <Tabs.Screen name="chatbot/index" options={{ title: "Chatbot" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
    </Tabs>
  );
}
