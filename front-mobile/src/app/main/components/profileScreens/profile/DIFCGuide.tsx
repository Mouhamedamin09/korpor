import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

export default function FinancialHubGuide() {
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
          What are Tunisia and France’s financial centers?
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
            Tunis Financial Harbour:{" "}
          </Text>
          An emerging financial district near Tunis, designed to attract
          international banks, investment firms, and fintech innovators to
          support Tunisia's economic development.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            La Défense, Paris:{" "}
          </Text>
          La Défense is Europe’s largest business district and France’s
          financial capital, home to major banks, insurers, and investment firms
          operating across Europe and beyond.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Legal & Regulatory Systems:{" "}
          </Text>
          In Tunisia, financial services are regulated by the{" "}
          <Text className="font-semibold">BCT</Text> and{" "}
          <Text className="font-semibold">CMF</Text>. In France, oversight is
          provided by the <Text className="font-semibold">AMF</Text> and{" "}
          <Text className="font-semibold">ACPR</Text> under the Banque de
          France.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Financial Infrastructure:{" "}
          </Text>
          Both Tunisia and France offer modern infrastructure with secure
          digital services, banking innovation, and investment platforms that
          follow international standards.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Strategic Location:{" "}
          </Text>
          Tunisia connects Europe, the Middle East, and Africa, while France
          serves as a financial gateway to the EU. Both countries offer access
          to regional and global markets.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Strong Regulatory Oversight:{" "}
          </Text>
          Regulators such as the AMF (France) and CMF (Tunisia) ensure
          transparency, investor protection, and financial stability through
          regular audits and strict guidelines.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Foreign Investment Support:{" "}
          </Text>
          Tunisia and France support foreign investment through legal guarantees
          and partnerships, encouraging the growth of international financial
          services.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Tax Incentives & Frameworks:{" "}
          </Text>
          Special economic zones in Tunisia and EU-aligned tax frameworks in
          France provide incentives for financial institutions to operate
          locally and regionally.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Global Rankings & Reputation:{" "}
          </Text>
          France consistently ranks in the Global Financial Centres Index
          (GFCI), while Tunisia is investing heavily in regulatory reform and
          financial innovation to grow its profile.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Financial Ecosystems:{" "}
          </Text>
          Both countries host local and international banks, fintech startups,
          asset managers, and regulators that create healthy and competitive
          financial ecosystems.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Innovation & Fintech:{" "}
          </Text>
          The Banque de France and Tunisian financial bodies actively support
          digital banking, open finance, and regulatory sandboxes for fintech
          innovation.
        </Text>
      </View>
    </ScrollView>
  );
}
