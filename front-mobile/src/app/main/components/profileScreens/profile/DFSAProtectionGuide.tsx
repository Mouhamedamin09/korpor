import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

export default function InvestorProtectionGuide() {
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
          How is your money protected?
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
              Updated over 1 month ago
            </Text>
          </View>
        </View>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Tunisia – CMF:{" "}
          </Text>
          The{" "}
          <Text className="font-bold">Conseil du Marché Financier (CMF)</Text>{" "}
          is the financial markets authority in Tunisia. It oversees market
          stability, transparency, and investor protection in financial
          operations and products.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            France – AMF:{" "}
          </Text>
          The{" "}
          <Text className="font-bold">
            Autorité des Marchés Financiers (AMF)
          </Text>{" "}
          regulates financial markets in France. It ensures investor protection,
          market transparency, and compliance by financial institutions.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Client Money Protection:{" "}
          </Text>
          Both CMF and AMF require strict segregation of client funds from
          company operational accounts. This protects your money even if the
          company faces financial difficulties.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Regular Auditing:{" "}
          </Text>
          Regulated companies are audited regularly to ensure transparency,
          financial health, and compliance with laws. This includes internal
          procedures and client fund handling.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Capital Requirements:{" "}
          </Text>
          Licensed firms must maintain sufficient capital reserves to cover
          operational risks and ensure client obligations can be met at all
          times.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Transparency & Disclosure:{" "}
          </Text>
          CMF and AMF regulations require companies to clearly disclose risks,
          fees, and product conditions so that investors can make informed
          decisions.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Anti-Money Laundering (AML) & KYC:{" "}
          </Text>
          Regulated firms must comply with AML laws and perform identity
          verification (KYC) to prevent fraud and protect the integrity of the
          financial system.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Dispute Resolution:{" "}
          </Text>
          Both CMF and AMF provide mechanisms to resolve conflicts between
          clients and financial institutions fairly and independently.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            How to Verify a License:{" "}
          </Text>
          You can verify a financial company’s registration on the official
          websites of the{" "}
          <Text className="font-semibold underline">CMF (Tunisia)</Text> and the{" "}
          <Text className="font-semibold underline">AMF (France)</Text> to
          ensure they are authorized and compliant.
        </Text>
      </View>
    </ScrollView>
  );
}
