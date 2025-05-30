import React from "react";
import { View, Text, Image, Pressable, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

export interface PersonalCardProps {
  imageUrl: string;
  linkedInUrl?: string;
  name: string;
  role: string;
  description: string;
  logoUrl?: string;
}

const PersonalCard: React.FC<PersonalCardProps> = ({
  imageUrl,
  linkedInUrl,
  name,
  role,
  description,
}) => {
  const openLinkedIn = () => linkedInUrl && Linking.openURL(linkedInUrl);

  return (
    <Pressable
      onPress={openLinkedIn}
      android_ripple={{ color: "#e5e5e5" }}
      className="mx-4 my-6"
    >
      <View className="rounded-3xl shadow-xl overflow-hidden bg-white border border-gray-300">
        {/* Gradient Header with overlapping avatar */}
        <LinearGradient
          colors={["#38bdf8", "#6366f1", "#8b5cf6"]}
          className="h-40 w-full justify-center items-center"
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 48,
              overflow: "hidden",
              borderWidth: 4,
              borderColor: "#fff",
            }}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 40,
                resizeMode: "cover",
              }}
            />
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="p-5">
          <Text className="text-xl font-bold text-gray-900">{name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{role}</Text>
          <Text className="text-base text-gray-700 mt-3 leading-relaxed">
            {description}
          </Text>

          {/* Social / Action icons */}
          {linkedInUrl && (
            <View className="flex-row justify-center space-x-6 mt-4">
              <Pressable
                onPress={openLinkedIn}
                className="p-2 rounded-full bg-blue-100"
              >
                <Feather name="linkedin" size={24} color="#0A66C2" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default PersonalCard;
