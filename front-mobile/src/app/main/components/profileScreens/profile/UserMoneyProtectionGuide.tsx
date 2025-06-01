import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

export default function UserMoneyProtectionGuide() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="bg-surface border-b border-border py-4 px-4 flex-row items-center shadow-sm mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-surfaceText">
          How does DFSA protect user Money?
        </Text>
      </View>

      <View className="px-4">
        <View className="flex-row items-center mb-4">
          <Image
            source={require("@assets/khalil.png")}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-lg font-bold text-surfaceText">
              Khalil Zouari
            </Text>
            <Text className="text-sm text-mutedText">
              Written by Khalil Zouari
            </Text>
            <Text className="text-sm text-mutedText">
              Updated over 1 months ago
            </Text>
          </View>
        </View>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Comprehensive Regulatory Framework:{" "}
          </Text>
          DFSA provides a robust regulatory framework specifically designed to
          protect individual investors and their funds from financial misconduct
          and institutional failures.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Segregated Account Requirements:{" "}
          </Text>
          All client funds must be held in segregated bank accounts, completely
          separate from the firm's own operational funds. This ensures your
          money remains yours even in adverse circumstances.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Independent Custody:{" "}
          </Text>
          Client assets are held by independent custodians, adding an extra
          layer of protection. These custodians are also regulated entities with
          their own obligations to protect client assets.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Regular Reporting:{" "}
          </Text>
          DFSA requires firms to provide regular reports on client money and
          asset positions, ensuring ongoing monitoring and compliance with
          protection requirements.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Risk Management Standards:{" "}
          </Text>
          Strict risk management protocols are enforced to prevent excessive
          risk-taking with client funds. This includes capital adequacy
          requirements and stress testing.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Professional Standards:{" "}
          </Text>
          All personnel handling client money must meet specific professional
          standards and undergo regular training on client protection
          requirements.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Enforcement Actions:{" "}
          </Text>
          DFSA has the power to take immediate action against firms that fail to
          protect client money, including freezing assets, imposing fines, or
          revoking licenses.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Insurance Requirements:{" "}
          </Text>
          Regulated firms must maintain adequate professional indemnity
          insurance to cover potential losses and ensure client compensation in
          case of errors or misconduct.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            24/7 Monitoring:{" "}
          </Text>
          DFSA employs continuous monitoring systems to detect any
          irregularities in client money handling and can intervene immediately
          when necessary.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Client Rights:{" "}
          </Text>
          You have specific rights under DFSA regulations, including the right
          to information about how your money is protected and the right to
          complain to the regulator if you have concerns.
        </Text>
      </View>
    </ScrollView>
  );
}
