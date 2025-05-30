// @main/components/profileScreens/components/ui/ProfileCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface ProfileCardProps {
  initials: string;
  name: string;
  email: string;
  phone: string;
  accountType: string;
  onEmailUpdate: () => void;
  onPhoneUpdate: () => void;
  onSwitchAccount: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  initials,
  name,
  email,
  phone,
  accountType,
  onEmailUpdate,
  onPhoneUpdate,
  onSwitchAccount,
}) => {
  return (
    <View className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
      {/* Avatar and Name */}
      <View className="flex-row items-center mb-4">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-green-200">
          <Text className="text-lg font-bold text-gray-900">{initials}</Text>
        </View>
        <Text className="text-base font-medium text-gray-900">{name}</Text>
      </View>

      {/* Email with Update */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <Feather name="mail" size={20} color="black" className="mr-4" />
          <Text className="text-base text-gray-900 flex-1 flex-wrap">
            {email}
          </Text>
        </View>
        <TouchableOpacity onPress={onEmailUpdate}>
          <Text className="text-base font-medium text-gray-700">Update</Text>
        </TouchableOpacity>
      </View>

      <View className="h-px bg-gray-100 mb-4" />

      {/* Phone with Update */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Feather name="phone" size={20} color="black" className="mr-4" />
          <Text className="text-base text-gray-900">{phone}</Text>
        </View>
        <TouchableOpacity onPress={onPhoneUpdate}>
          <Text className="text-base font-medium text-gray-700">Update</Text>
        </TouchableOpacity>
      </View>

      <View className="h-px bg-gray-100 mb-4" />

      {/* Account Type with Switch */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="user" size={20} color="black" className="mr-4" />
          <Text className="text-base text-gray-900">{accountType}</Text>
        </View>
        <TouchableOpacity onPress={onSwitchAccount}>
          <Text className="text-base font-medium text-gray-700">Switch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileCard;
