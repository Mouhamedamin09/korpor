// screens/NotificationSettingsScreen.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, Switch } from "react-native";
import {
  TopBar,
  SwitchItem,
} from "@main/components/profileScreens/components/ui";
import Feather from "react-native-vector-icons/Feather";

const NotificationSettingsScreen: React.FC = () => {
  const [propertyLaunches, setPropertyLaunches] = useState(true);
  const [fundLaunches, setFundLaunches] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [investmentUpdates, setInvestmentUpdates] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <ScrollView className="flex-1 bg-background">
      <TopBar
        title="Notifications Settings"
        onBackPress={() => console.log("Back clicked")}
      />
      <View className="p-4">
        <Text className="text-sm text-surfaceText mb-4">
          Each setting controls both email and push notifications.
        </Text>

        <SwitchItem
          label="Property launches"
          value={propertyLaunches}
          onValueChange={setPropertyLaunches}
          description="Get notified about all new property launches and funding updates."
          iconName="bell"
        />

        <SwitchItem
          label="Fund launches"
          value={fundLaunches}
          onValueChange={setFundLaunches}
          description="Stay updated on new fund launches and their funding progress."
          iconName="briefcase"
        />

        <SwitchItem
          label="Product updates"
          value={productUpdates}
          onValueChange={setProductUpdates}
          description="Be the first to know about new features and product updates."
          iconName="edit"
        />

        <SwitchItem
          label="Marketing"
          value={marketing}
          onValueChange={setMarketing}
          description="Receive offers, promotions, and key announcements."
          iconName="mail"
        />

        <SwitchItem
          label="Investment updates"
          value={investmentUpdates}
          onValueChange={setInvestmentUpdates}
          description="Track progress of your investments and funding updates."
          iconName="trending-up"
        />

        <SwitchItem
          label="Newsletter"
          value={newsletter}
          onValueChange={setNewsletter}
          description="Get our bi-weekly newsletter with the latest insights."
          iconName="file-text"
        />

        <View className="bg-surface border border-border rounded-xl p-4 mb-4">
          <Text className="text-base font-semibold text-surfaceText mb-2">
            Push notifications
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base text-surfaceText">
              Enable Push notifications
            </Text>
            <Switch
              trackColor={{ false: "#f4f4f4", true: "#2b7fff" }}
              thumbColor={pushNotifications ? "#FFFFFF" : "#FFFFFF"}
              ios_backgroundColor="#f4f4f4"
              onValueChange={setPushNotifications}
              value={pushNotifications}
            />
          </View>
          <Text className="text-sm text-mutedText">
            Disabling this will turn off all push notifications, but you’ll
            still get emails for the selected topics above.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default NotificationSettingsScreen;
