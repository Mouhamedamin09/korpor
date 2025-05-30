/* -----------------------------------------------------------
   🔹  HowItWorksWithFAQs — stepper + FAQs accordion
       Palette: Emerald #10B981, Black, White
   ----------------------------------------------------------- */

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// -------------------------------------------------------------------
// Types & constants
// -------------------------------------------------------------------

type Step = {
  idx: number;
  title: string;
  subtitle: string;
};

type FAQ = {
  q: string;
  a: string;
};

const STEPS: Step[] = [
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
];

const FAQS: FAQ[] = [
  {
    q: "How does it work?",
    a: "AutoInvest is a hands‑free way to build a diversified real‑estate portfolio. You simply choose an investment theme according to your preferences and set your monthly deposit amount. Each month money will be automatically deposited to your Korpor wallet and AutoInvest will deploy your capital as properties become available that match your theme.",
  },
  {
    q: "Can I pause or cancel my AutoInvest?",
    a: "Yes, you can pause or cancel your AutoInvest at any time which will stop all automatic deposits and investments. If paused you can simply resume whenever you like. If you decide to cancel your AutoInvest you may create a new one at any time.",
  },
  {
    q: "Can I make changes to my AutoInvest?",
    a: "If you would like to make any changes to your AutoInvest you will need to create a new set‑up. This can be done from the AutoInvest settings.",
  },
  {
    q: "Are there any fees?",
    a: "AutoInvest is completely free! There are no additional fees for using the feature.",
  },
  {
    q: "When will money be taken from my card?",
    a: "Funds will be automatically taken from your linked debit card and deposited to your wallet on your selected recurring date each month. Money will never be directly debited from your card for individual investments.",
  },
  {
    q: "What happens if there are no investments matching my AutoInvest theme?",
    a: "If no properties match your selected theme during the month, your deposited funds will remain in your wallet and will be available for manual investment. We always aim to continuously provide investment opportunities that match your selected theme.",
  },
  {
    q: "Will my dividends be reinvested?",
    a: "Not at the moment. Dividends will be credited to your wallet as normal, and you can choose to reinvest or withdraw them. We plan to introduce automatic dividend reinvestment in a future update.",
  },
];

const { width } = Dimensions.get("window");
const CARD_W = width * 0.75; // 75% of viewport width
const CARD_H = 200;
const GREEN = "#10B981";

const Insight: React.FC = () => (
  <View
    style={{
      backgroundColor: "#F0FDF4",
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: 24,
    }}
  >
    <View style={{ flex: 1, marginRight: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: "#000" }}>
        Investors on Korpor who invest consistently earn more.
      </Text>
    </View>
    <Feather name="trending-up" size={40} color={GREEN} />
  </View>
);

// -------------------------------------------------------------------
// StepCard component
// -------------------------------------------------------------------

const StepCard: React.FC<Step> = ({ idx, title, subtitle }) => (
  <View
    style={{
      width: CARD_W,
      height: CARD_H,
      borderRadius: 24,
      backgroundColor: GREEN,
      padding: 24,
      justifyContent: "flex-start",
    }}
  >
    {/* corner number badge */}
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        height: 36,
        width: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
      }}
    >
      <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
        {idx}
      </Text>
    </View>

    {/* title */}
    <Text
      style={{
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
      }}
      numberOfLines={2}
    >
      {title}
    </Text>

    {/* subtitle */}
    <Text style={{ color: "#fff", fontSize: 14 }} numberOfLines={4}>
      {subtitle}
    </Text>
  </View>
);

// -------------------------------------------------------------------
// FAQ item component (accordion)
// -------------------------------------------------------------------

const FAQItem: React.FC<FAQ> = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.easeInEaseOut();
    setOpen((prev) => !prev);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          paddingVertical: 18,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{ fontSize: 15, fontWeight: "600", color: "#111", flex: 1 }}
        >
          {q}
        </Text>
        <Feather
          name="chevron-down"
          size={20}
          color={GREEN}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>
      {open && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#fff",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderTopWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <Text style={{ fontSize: 14, color: "#4B5563", lineHeight: 20 }}>
            {a}
          </Text>
        </View>
      )}
    </View>
  );
};

// -------------------------------------------------------------------
// HowItWorks + FAQs section
// -------------------------------------------------------------------

const HowItWorks: React.FC = () => (
  <View>
    {/* heading */}
    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginVertical: 8,
      }}
    >
      How it works
    </Text>

    {/* horizontal scroller */}
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_W + 16}
      decelerationRate={0}
      style={{ marginBottom: 24 }}
    >
      {STEPS.map((step) => (
        <View key={step.idx} style={{ marginRight: 16 }}>
          <StepCard {...step} />
        </View>
      ))}
    </ScrollView>

    {/* FAQs */}
    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
      }}
    >
      FAQs
    </Text>
    {FAQS.map((item, idx) => (
      <FAQItem key={idx} {...item} />
    ))}
    <Insight />
  </View>
);

export default HowItWorks;
