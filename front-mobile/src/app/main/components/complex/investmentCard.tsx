import { View, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import * as Progress from "react-native-progress";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

export default function InvestmentCard({ property }: { property: any }) {
  return (
    <View style={{ width: CARD_WIDTH }} className="self-center mb-6">
      <LinearGradient
        colors={["#008F6B", "#00B37D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: 210,
          borderRadius: 20,
          overflow: "hidden", // required to clip overlays inside
          padding: 20,
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

        {/* Info Rows */}
        {[
          ["Funding Goal", property.total_needed],
          ["Funded", property.current_funded],
          ["Return", `${property.annual_return_rate}% yearly`],
          ["Min Investment", property.min_investment],
          ["Expected ROI", `${property.expected_roi}%`],
        ].map(([label, value]) => (
          <View key={label} className="flex-row justify-between py-1">
            <Text className="text-white text-sm opacity-90">{label}</Text>
            <Text className="text-white font-semibold text-sm">
              {typeof value === "number"
                ? value.toLocaleString() + (label === "Return" ? "" : " DT")
                : value}
            </Text>
          </View>
        ))}

        {/* Extra Info Section */}
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Feather name="calendar" size={14} color="white" />
            <Text className="text-white ml-2 text-xs font-medium opacity-90">
              {property.upload_date}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="tag" size={14} color="white" />
            <Text className="text-white ml-2 text-xs font-medium opacity-90">
              {property.current_value.toLocaleString()} DT
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="percent" size={14} color="white" />
            <Text className="text-white ml-2 text-xs font-medium opacity-90">
              {property.funding_percentage}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mt-3">
          <Progress.Bar
            progress={property.funding_percentage / 100}
            width={null}
            height={4}
            color="#ffffff"
            unfilledColor="rgba(255,255,255,0.3)"
            borderWidth={0}
          />
        </View>
      </LinearGradient>
    </View>
  );
}
