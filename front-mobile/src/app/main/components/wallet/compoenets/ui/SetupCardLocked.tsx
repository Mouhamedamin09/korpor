import { View, Text, Dimensions } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import * as Progress from "react-native-progress";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_W = width - 32;
const CARD_H = 230;
const GREEN = "#10B981";

interface Props {
  totalInvested: number;
  minimumRequired?: number;
  type?: "invest" | "reinvest";
}

const SetupCardLocked: React.FC<Props> = ({
  totalInvested,
  minimumRequired = 2000,
  type = "reinvest",
}) => {
  const required = minimumRequired;
  const progress = Math.min(totalInvested / required, 1);
  const isReinvest = type === "reinvest";

  return (
    <View style={{ width: CARD_W }} className="self-center mb-6">
      <LinearGradient
        colors={["#008F6B", "#00B37D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: CARD_H,
          borderRadius: 20,
          overflow: "hidden",
          padding: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Overlay bars */}
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

        <Feather
          name="lock"
          size={40}
          color="white"
          style={{ marginBottom: 12 }}
        />

        <Text className="text-white text-lg font-semibold mb-1">
          Auto{isReinvest ? "Reinvest" : "Invest"} Locked
        </Text>

        <Text className="text-white text-sm text-center opacity-90 mb-5 font-semibold">
          You need to invest at least {required.toLocaleString()} TND to unlock
          Auto{isReinvest ? "Reinvest" : "Invest"}
        </Text>

        <View style={{ width: "100%" }} className="mb-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-medium text-white opacity-90">
              {totalInvested.toLocaleString()} TND invested
            </Text>
            <Text className="text-xs font-medium text-white opacity-90">
              {required.toLocaleString()} TND required
            </Text>
          </View>

          <Progress.Bar
            progress={progress}
            width={null}
            height={6}
            borderRadius={12}
            color="#ffffff"
            unfilledColor="rgba(255,255,255,0.3)"
            borderWidth={0}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export default SetupCardLocked;
