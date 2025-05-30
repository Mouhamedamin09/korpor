// screens/BuildingInfo.tsx
import { View, Text, Image, Linking } from "react-native";
import {
  GrayContainer,
  Button,
  Document,
  BorderContainer,
} from "@main/components/ui/index";

const Calendar = require("@assets/calendar1.png");
const Marker = require("@assets/marker.png");
const DevIcon = require("@assets/developer.png");
const DocsIcon = require("@assets/document.png");

type File = { text: string; url: string };

export default function BuildingInfo({
  documents,
  propertyAge,
  developerName,
  developerSite,
  address,
  locationQuery, // or "lat,lng"
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

  return (
    <View>
      <Text className="text-2xl font-medium text-text mb-4">
        Building Info & Developer
      </Text>

      <GrayContainer>
        {/* ─ Property age ─ */}
        <Row icon={Calendar} label="Property Age:" value={propertyAge} />

        {/* ─ Developer ─ */}
        <Row icon={DevIcon} label="Developer:" value={developerName} />

        {/* ─ Address ─ */}
        <Row icon={Marker} label="Address:" value={address} />

        {/* ─ Documents ─ */}
        <View>
          <Header icon={DocsIcon} text="Documents:" />
          <View className="mr-4 ml-1">
            {documents.map((d) => (
              <Document key={d.url} text={d.text} url={d.url} />
            ))}
          </View>
        </View>

        {/* ─ Action buttons ─ */}
        <View className="flex-row items-center justify-between mt-4">
          <Button text="Location" onPress={openMaps} />
          <Button text="Developer" onPress={openDeveloper} />
        </View>
      </GrayContainer>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Tiny helpers – keeps the JSX above clean                           */
/* ------------------------------------------------------------------ */
function Row({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Header icon={icon} text={label} />
      <Text className="text-medium font-medium text-text">{value}</Text>
    </View>
  );
}

function Header({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="flex-row items-center">
      <Image source={icon} className="w-4 h-4" />
      <View className="w-2" />
      <Text className="text-medium font-medium text-text">{text}</Text>
    </View>
  );
}
