/* -----------------------------------------------------------
   🔹  SetupCard — matches Carousel card style (enhanced)
   ----------------------------------------------------------- */

import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_W = width - 32; // identical to Carousel
const CARD_H = 230; // ↑ taller card

const SetupCard: React.FC = () => {
  const router = useRouter();

  return (
    <View style={{ width: CARD_W }} className="self-center mb-6">
      <LinearGradient
        colors={["#008F6B", "#00B37D"]} // same gradient as Carousel
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: CARD_H,
          borderRadius: 20,
          overflow: "hidden",
          padding: 24, // more breathing room
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* decorative overlay bars ------------------------- */}
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

        {/* logo ------------------------------------------- */}
        <Feather
          name="activity"
          size={40}
          color="#ffffff"
          style={{ marginBottom: 12 }}
        />

        {/* text + CTA ------------------------------------- */}
        <Text className="text-white text-center text-lg font-semibold mb-2">
          No AutoInvest setup
        </Text>
        <Text className="text-white text-center text-sm opacity-90 mb-5">
          Automate your investment strategy and enjoy peace of mind{"\n"}
          as your portfolio grows steadily
        </Text>

        <TouchableOpacity
          style={{ width: "90%" }}
          className="bg-black self-center rounded-lg px-6 py-3 active:opacity-80 mb-2"
          onPress={() => router.push("/main/components/wallet/walletscreens/StartAutoInvest")}
        >
          <Text className="text-base font-semibold text-white text-center">
            Setup now
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default SetupCard;
