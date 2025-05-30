// components/Timeline.tsx
import React from "react";
import { View, Text, Image } from "react-native";

interface TimelineTexts {
  title: string;
  description: string;
}

interface TimelineItem {
  time: string;
  texts: {
    done: TimelineTexts;
    active: TimelineTexts;
    todo: TimelineTexts;
  };
}

interface Props {
  /** 1‑based index of the current (active) step */
  currentStep: number;
}

/**
 * All copy lives here so wording can evolve without touching the component code.
 * Each step defines its own copy for the 3 possible states.
 */
const steps: TimelineItem[] = [
  {
    time: "Apr 24",
    texts: {
      todo: {
        title: "Property funding not started",
        description:
          "Investors will soon be able to commit funds to this property.",
      },
      active: {
        title: "Property funding in progress",
        description:
          "Funding is almost complete – once 100% is reached we’ll move to the next step.",
      },
      done: {
        title: "Property funding complete",
        description: "The property has been fully funded by investors.",
      },
    },
  },
  {
    time: "May 9",
    texts: {
      todo: {
        title: "Ownership documents pending",
        description:
          "Share certificates will be prepared once funding is complete.",
      },
      active: {
        title: "Preparing ownership documents",
        description:
          "We’re issuing your Property Share Certificates – this usually takes up to 2 weeks.",
      },
      done: {
        title: "Ownership documents distributed",
        description:
          "Your Property Share Certificates have been issued and are available in your dashboard.",
      },
    },
  },
  {
    time: "May 31",
    texts: {
      todo: {
        title: "Rental income upcoming",
        description:
          "Projected first rental payment date: 1 Jun 2025 (subject to change).",
      },
      active: {
        title: "First rental payment processing",
        description:
          "We’re collecting rent and preparing to distribute the first payment to investors.",
      },
      done: {
        title: "First rental payment sent",
        description:
          "The first rental payment has been credited to your wallet.",
      },
    },
  },
];

const Tick = require("@assets/tick-white.png");
const Clock = require("@assets/clock-white.png");
const Pending = require("@assets/pending-white.png");

const GREEN = "#2b7fff";
const GREY = "#d1d5db";

const Timeline: React.FC<Props> = ({ currentStep }) => (
  <View className="py-4">
    {steps.map((step, idx) => {
      /* ───────────── determine status (1‑based) ───────────── */
      const stepIndex = idx + 1;
      const status: "done" | "active" | "todo" =
        stepIndex < currentStep
          ? "done"
          : stepIndex === currentStep
          ? "active"
          : "todo";

      /* ───────────── visual assets per status ───────────── */
      const icon =
        status === "done" ? Tick : status === "active" ? Clock : Pending;
      const circleBg = status === "todo" ? GREY : GREEN;
      const iconTint = status === "todo" ? "#374151" /* gray‑700 */ : "white";

      /* ───────────── vertical line ───────────── */
      const isLast = idx === steps.length - 1;
      const lineColor = status === "done" ? GREEN : GREY;
      const lineStyle = status === "done" ? "solid" : "dashed";

      /* ───────────── dynamic copy ───────────── */
      const { title, description } = step.texts[status];

      return (
        <View key={idx} className="flex-row pb-2 relative">
          {/* connecting line */}
          {!isLast && (
            <View
              className="absolute left-[17px] top-0 bottom-0"
              style={{
                borderLeftWidth: 2,
                borderColor: lineColor,
                borderStyle: lineStyle,
              }}
            />
          )}

          {/* circle + icon */}
          <View className="w-10 items-center">
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: circleBg }}
            >
              <Image
                source={icon}
                className="w-3.5 h-3.5"
                style={{ tintColor: iconTint }}
              />
            </View>
          </View>

          {/* copy */}
          <View className="flex-1 pl-4">
            <Text className="text-lg font-medium text-text">{title}</Text>
            <Text className="text-sm text-gray-600 mt-1">{description}</Text>
            <Text className="text-xs text-gray-400 mt-1">{step.time}</Text>
          </View>
        </View>
      );
    })}
  </View>
);

export default Timeline;
