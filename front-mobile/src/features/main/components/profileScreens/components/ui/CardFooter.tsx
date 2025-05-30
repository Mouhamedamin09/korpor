/* ───────────── CardFooter ───────────── */
/* place this just under your <Card> closing tag */
import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import Feather from "react-native-vector-icons/Feather";

/* drop your theme tokens in tailwind.config so bg-card / text-muted-foreground
   resolve correctly – that’s how shadcn does it */

const CardFooter: React.FC = () => (
  <View className="border-t border-zinc-200 dark:border-zinc-700 bg-card/60 px-6 py-4 space-y-4">
    {/* tagline + rating */}
    <View className="flex-row justify-between items-center">
      <Text className="text-base font-medium text-card-foreground">
        Join our global investors
      </Text>

      <View className="flex-row items-center gap-1">
        <Feather name="star" size={16} color="#fbbf24" />
        <Text className="text-sm text-muted-foreground">4.5 • 2 k reviews</Text>
      </View>
    </View>

    {/* primary action */}
    <TouchableOpacity
      onPress={() => Linking.openURL("https://www.korpor.com")}
      className="flex-row items-center justify-center rounded-lg border border-transparent
                 bg-white/70 dark:bg-zinc-900/60 px-4 py-3 active:scale-95"
    >
      <Image
        source={require("@assets/korporBlack.png")}
        style={{ width: 80, height: 48 }}
        resizeMode="contain"
        className="mr-3"
      />
      <Text className="text-base font-semibold text-emerald-600">
        Visit Korpor
      </Text>
      <Feather
        name="arrow-up-right"
        size={18}
        color="#059669"
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  </View>
);

export default CardFooter;
