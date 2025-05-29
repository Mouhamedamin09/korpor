import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GREEN = "#10B981";

const HOW_IT_WORKS_STEPS = {
  invest: [
    {
      idx: 1,
      title: "Select an amount",
      subtitle:
        "Choose the monthly deposit amount. We’ll invest it automatically into properties throughout the month.",
    },
    {
      idx: 2,
      title: "Select a theme",
      subtitle:
        "Pick expert‑curated themes—Growth, Income, or Index—to match your goals.",
    },
    {
      idx: 3,
      title: "Confirm & relax",
      subtitle:
        "Review once, turn AutoInvest on, and watch your diversified portfolio grow month over month.",
    },
    {
      idx: 4,
      title: "Review and start",
      subtitle:
        "Once you've reviewed your setup, you can adjust or pause AutoInvest anytime.",
    },
  ],
  reinvest: [
    {
      idx: 1,
      title: "Enable Reinvest",
      subtitle:
        "Turn on Auto Reinvest to ensure your rental returns are automatically put back to work.",
    },
    {
      idx: 2,
      title: "Customize strategy",
      subtitle:
        "Choose whether you want to split evenly or follow an advanced strategy for reinvesting.",
    },
    {
      idx: 3,
      title: "Sit back and earn",
      subtitle:
        "Once activated, all your eligible dividends will be reinvested automatically every cycle.",
    },
  ],
};

const FAQS_COMMON = [
  {
    q: "Can I pause or cancel the automation?",
    a: "Yes, both AutoInvest and Auto Reinvest can be paused or canceled anytime from settings.",
  },
  {
    q: "Are there any fees?",
    a: "No additional fees are charged for enabling these features.",
  },
];

const Insight: React.FC = () => (
  <View className="rounded-2xl bg-emerald-50 p-4 flex-row items-end mt-6">
    <View className="flex-1 mr-3">
      <Text className="text-[15px] font-semibold text-black">
        Investors on Korpor who automate earn more.
      </Text>
    </View>
    <Feather name="trending-up" size={36} color={GREEN} />
  </View>
);

const StepCard: React.FC<{ idx: number; title: string; subtitle: string }> = ({
  idx,
  title,
  subtitle,
}) => (
  <View className="w-[280px] h-[200px] rounded-2xl bg-emerald-500 p-6">
    <View className="w-9 h-9 rounded-full bg-white/90 items-center justify-center mb-3">
      <Text className="text-black text-sm font-bold">{idx}</Text>
    </View>
    <Text className="text-white text-[18px] font-bold mb-1" numberOfLines={2}>
      {title}
    </Text>
    <Text className="text-white text-sm" numberOfLines={4}>
      {subtitle}
    </Text>
  </View>
);

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.easeInEaseOut();
    setOpen(!open);
  };

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={toggle}
        className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between"
        activeOpacity={0.85}
      >
        <Text className="text-[15px] font-semibold text-black flex-1">{q}</Text>
        <Feather
          name="chevron-down"
          size={20}
          color={GREEN}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>
      {open && (
        <View className="bg-white rounded-b-xl border-t border-gray-100 px-4 pt-2 pb-3">
          <Text className="text-sm text-gray-600 leading-5">{a}</Text>
        </View>
      )}
    </View>
  );
};

const HowItWorks: React.FC<{ type: "invest" | "reinvest" }> = ({ type }) => (
  <View>
    <Text className="text-[18px] font-semibold text-black my-2">
      How it works
    </Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
    >
      {HOW_IT_WORKS_STEPS[type].map((step) => (
        <View key={step.idx} className="mr-4">
          <StepCard {...step} />
        </View>
      ))}
    </ScrollView>

    <Text className="text-[18px] font-semibold text-black mb-3">FAQs</Text>
    {FAQS_COMMON.map((faq, idx) => (
      <FAQItem key={idx} {...faq} />
    ))}
    <Insight />
  </View>
);

export default HowItWorks;
