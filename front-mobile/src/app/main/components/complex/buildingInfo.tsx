// screens/BuildingInfo.tsx
import React from "react";
import { View, Text, Linking, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

type File = { text: string; url: string };

export default function BuildingInfo({
  documents,
  propertyAge,
  developerName,
  developerSite,
  address,
  locationQuery,
}: {
  documents: File[];
  propertyAge: string;
  developerName: string;
  developerSite: string;
  address: string;
  locationQuery: string;
}) {
  const openMaps = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        locationQuery
      )}`
    );
  const openDeveloper = () => Linking.openURL(developerSite);

  /* ───── data rows ───── */
  const infoRows = [
    { icon: "calendar", label: "Property Age", value: propertyAge },
    { icon: "user", label: "Developer", value: developerName },
    { icon: "map-pin", label: "Address", value: address },
  ];

  return (
    <LinearGradient
      colors={["#008F6B", "#00B37D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 20 }}
    >
      {/* overlay stripes */}
      <View
        style={{
          position: "absolute",
          left: -60,
          top: -25,
          width: 260,
          height: 110,
          backgroundColor: "rgba(255,255,255,0.06)",
          transform: [{ rotate: "-20deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -80,
          bottom: -25,
          width: 260,
          height: 110,
          backgroundColor: "rgba(255,255,255,0.04)",
          transform: [{ rotate: "-20deg" }],
        }}
      />

      {/* header */}
      <Text className="text-white text-xl font-semibold mb-4">
        Building Info & Developer
      </Text>

      {/* info rows */}
      {infoRows.map(({ icon, label, value }) => (
        <View key={label} className="flex-row justify-between py-1">
          <View className="flex-row items-center">
            <Feather name={icon as any} size={16} color="white" />
            <Text className="text-white ml-2 text-sm opacity-90">{label}</Text>
          </View>
          <Text className="text-white font-semibold text-sm">{value}</Text>
        </View>
      ))}

      {/* documents */}
      {documents.length > 0 && (
        <>
          <View className="h-px bg-white opacity-30 my-4" />
          <Text className="text-white font-semibold mb-2">Documents</Text>
          {documents.map((d) => (
            <Pressable
              key={d.url}
              onPress={() => Linking.openURL(d.url)}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              className="flex-row items-center mb-2"
            >
              <Feather name="file-text" size={16} color="#fff" />
              <Text className="text-white ml-2 text-sm underline">
                {d.text}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      {/* action buttons */}
      <View className="flex-row mt-4">
        <ActionBtn label="Location" onPress={openMaps} />
        <View className="w-4" />
        <ActionBtn label="Developer" onPress={openDeveloper} />
      </View>
    </LinearGradient>
  );
}

/* small outlined button */
function ActionBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      className="flex-1 py-2 rounded-xl border border-white items-center"
    >
      <Text className="text-white font-semibold text-sm">{label}</Text>
    </Pressable>
  );
}
