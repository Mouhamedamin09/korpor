import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

export default function DataProtectionGuide() {
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
          How does Korpor protect my data?
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
            End-to-End Encryption:{" "}
          </Text>
          We use AES-256 encryption to protect your personal and financial data
          during transfer and storage.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Secure Data Centers:{" "}
          </Text>
          Our infrastructure is hosted in secure data centers with biometric
          access, 24/7 surveillance, and disaster recovery systems.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Privacy by Design:{" "}
          </Text>
          Our systems are built with privacy as a core principle to ensure
          protection at every layer of development.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Access Controls:{" "}
          </Text>
          Only authorized personnel have access to your data, with full tracking
          and logging of access events.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Regular Security Audits:{" "}
          </Text>
          We conduct frequent security audits and vulnerability assessments to
          eliminate threats before they cause harm.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Data Minimization:{" "}
          </Text>
          We only collect the minimum data required to operate our services and
          do not store anything unnecessary.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            GDPR & Tunisian Compliance:{" "}
          </Text>
          We comply with the European GDPR (via CNIL in France) and Tunisia’s
          Organic Law 2004-63 on personal data protection. You can request data
          access, correction, or deletion at any time.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Incident Response:{" "}
          </Text>
          Our incident response team ensures immediate containment and
          communication in case of any security incident.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Employee Training:{" "}
          </Text>
          All team members are trained regularly on cybersecurity best practices
          and data privacy responsibilities.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Third-Party Vendors:{" "}
          </Text>
          Vendors must comply with our data protection policies and undergo
          audits to ensure they meet EU and Tunisian standards.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Data Retention Policy:{" "}
          </Text>
          We keep your data only as long as necessary or legally required. Once
          it's no longer needed, it's securely deleted.
        </Text>
      </View>
    </ScrollView>
  );
}
