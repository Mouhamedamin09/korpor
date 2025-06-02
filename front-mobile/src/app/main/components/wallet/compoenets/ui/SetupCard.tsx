import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import { AutoReinvestData } from "@main/services/autoReinvest";

const { width } = Dimensions.get("window");
const CARD_W = width - 32;
const CARD_H = 230;

interface Props {
  type: "invest" | "reinvest";
  autoReinvestData?: AutoReinvestData | null;
  onRefresh?: () => Promise<void>;
}

const SetupCard: React.FC<Props> = ({ type, autoReinvestData, onRefresh }) => {
  const router = useRouter();
  const isInvest = type === "invest";
  const hasActivePlan = autoReinvestData?.autoReinvestPlan?.status === "active";

  // If there's an active auto-reinvest plan, show different content
  if (!isInvest && hasActivePlan && autoReinvestData?.autoReinvestPlan) {
    const plan = autoReinvestData.autoReinvestPlan;
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
            name="check-circle"
            size={40}
            color="#ffffff"
            style={{ marginBottom: 12 }}
          />

          <Text className="text-white text-center text-lg font-semibold mb-2">
            AutoReinvest Active
          </Text>
          <Text className="text-white text-center text-sm opacity-90 mb-3 font-semibold">
            {plan.reinvestPercentage}% of rental income • {plan.theme} theme
          </Text>
          <Text className="text-white text-center text-xs opacity-80 mb-5">
            Total Reinvested: {plan.totalReinvested.toLocaleString()} TND
          </Text>

          <TouchableOpacity
            style={{ width: "90%" }}
            className="bg-black self-center rounded-lg px-6 py-3 active:opacity-80 mb-2"
            onPress={() =>
              router.push(
                "/main/components/wallet/walletscreens/ManageAutoReinvest"
              )
            }
          >
            <Text className="text-base font-semibold text-white text-center">
              Manage Plan
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

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
          name={isInvest ? "activity" : "refresh-ccw"}
          size={40}
          color="#ffffff"
          style={{ marginBottom: 12 }}
        />

        <Text className="text-white text-center text-lg font-semibold mb-2">
          No Auto{isInvest ? "Invest" : "Reinvest"} setup
        </Text>
        <Text className="text-white text-center text-sm opacity-90 mb-5 font-semibold">
          {isInvest
            ? "Automate your investment strategy and enjoy peace of mind\nas your portfolio grows steadily"
            : "Automatically reinvest your rental income to grow your portfolio\nwithout any manual effort"}
        </Text>

        <TouchableOpacity
          style={{ width: "90%" }}
          className="bg-black self-center rounded-lg px-6 py-3 active:opacity-80 mb-2"
          onPress={() =>
            router.push(
              isInvest
                ? "/main/components/wallet/walletscreens/StartAutoInvest"
                : "/main/components/wallet/walletscreens/StartAutoReinvest"
            )
          }
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
