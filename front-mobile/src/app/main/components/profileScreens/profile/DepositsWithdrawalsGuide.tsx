import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

export default function DepositsWithdrawalsGuide() {
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
          Learn about deposits and withdrawals
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
            Making Deposits:{" "}
          </Text>
          Adding funds to your Korpor wallet is simple and secure. You can
          deposit money using various methods to start investing in real estate.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Deposit Methods:{" "}
          </Text>
          We accept deposits via bank transfer, debit cards, and credit cards.
          Bank transfers are typically processed within 1-2 business days, while
          card payments are instant.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Minimum Deposit:{" "}
          </Text>
          The minimum deposit amount is{" "}
          <Text className="font-bold text-surfaceText">TND 100</Text>. There's
          no maximum limit, allowing you to invest as much as you're comfortable
          with.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Processing Times:{" "}
          </Text>
          Bank transfers: 1-2 business days. Debit/Credit cards: Instant.
          International transfers may take 3-5 business days depending on your
          bank.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Making Withdrawals:{" "}
          </Text>
          You can withdraw your available balance at any time. Withdrawals are
          processed to the same account or card you used for deposits for
          security purposes.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Withdrawal Limits:{" "}
          </Text>
          Minimum withdrawal amount is{" "}
          <Text className="font-bold text-surfaceText">TND 50</Text>. Daily
          withdrawal limit is{" "}
          <Text className="font-bold text-surfaceText">TND 10,000</Text> for
          verified accounts.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Withdrawal Processing:{" "}
          </Text>
          Withdrawals to bank accounts take 1-3 business days. Card refunds may
          take 5-10 business days depending on your bank's processing time.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Security Measures:{" "}
          </Text>
          All transactions are encrypted and monitored. We may request
          additional verification for large transactions to ensure account
          security.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">Fees: </Text>
          Deposits are free of charge. Withdrawal fees may apply depending on
          the method used. Bank transfers are typically free, while expedited
          withdrawals may incur a small fee.
        </Text>

        <Text className="text-lg text-surfaceText mb-4">
          <Text className="text-xl font-bold text-surfaceText">
            Important Note:{" "}
          </Text>
          Always ensure your account details are correct before initiating
          transactions. Contact our support team if you experience any delays or
          issues.
        </Text>
      </View>
    </ScrollView>
  );
}
