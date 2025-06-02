// components/Timeline.tsx
import React from "react";
import { View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";

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
  /** 1-based index of the current active step */
  currentStep: number;
}

/* ───────── copy for each step ───────── */
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
          "We’re issuing your Property Share Certificates – this usually takes up to 2 weeks.",
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
          "Projected first rental payment date: 1 Jun 2025 (subject to change).",
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

/* ───────── colours ───────── */
const BRAND_GREEN = "#10B981";
const GREY = "#d1d5db";

const Timeline: React.FC<Props> = ({ currentStep }) => (
  <View className="py-4">
    {steps.map((step, idx) => {
      /* determine status */
      const stepIndex = idx + 1;
      const status: "done" | "active" | "todo" =
        stepIndex < currentStep
          ? "done"
          : stepIndex === currentStep
          ? "active"
          : "todo";

      /* visuals */
      const circleBg = status === "todo" ? GREY : BRAND_GREEN;
      const iconColor = status === "todo" ? "#374151" : "white";
      const lineColor = status === "done" ? BRAND_GREEN : GREY;
      const lineStyle = status === "done" ? "solid" : "dashed";
      const isLast = idx === steps.length - 1;

      /* icon name */
      const iconName =
        status === "done" ? "check" : status === "active" ? "clock" : "loader";

      /* copy */
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
              <Feather name={iconName as any} size={14} color={iconColor} />
            </View>
          </View>

          {/* copy */}
          <View className="flex-1 pl-4">
            <Text className="text-lg font-medium text-gray-900">{title}</Text>
            <Text className="text-sm text-gray-600 mt-1">{description}</Text>
            <Text className="text-xs text-gray-400 mt-1">{step.time}</Text>
          </View>
        </View>
      );
    })}
  </View>
);

export default Timeline;
