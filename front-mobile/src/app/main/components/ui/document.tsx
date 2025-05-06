// ui/Document.tsx
import { Pressable, Text, Linking } from "react-native";

export default function Document({ text, url }: { text: string; url: string }) {
  const handlePress = async () => {
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else console.warn(`Can't open: ${url}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <Text className="text-sm underline text-textGray">{text}</Text>
    </Pressable>
  );
}
