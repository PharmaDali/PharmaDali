import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import { useProfile } from '@src/shared/hooks/useProfile';
import { toTitleCase } from '@src/shared/utils/stringUtils';

const PersonalDetails = () => {
  const router = useRouter();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fallbackText = 'Not Provided';

  const firstName = profile?.first_name ? toTitleCase(profile.first_name) : fallbackText;
  const lastName = profile?.last_name ? toTitleCase(profile.last_name) : fallbackText;
  const birthday = profile?.date_of_birth || fallbackText;
  const contactNumber = profile?.mobile_number || fallbackText;
  const email = profile?.email || fallbackText;

  const detailsList = [
    { label: 'First Name', value: firstName },
    { label: 'Last Name', value: lastName },
    { label: 'Birthday', value: birthday },
    { label: 'Contact Number', value: contactNumber },
    { label: 'Email Address', value: email },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
        <TouchableOpacity className="p-1" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#48AAD9" />
        </TouchableOpacity>
        <Text className="text-lg" style={styles.headerTitle}>
          Personal Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
        {detailsList.map((item, idx) => (
          <View
            key={idx}
            className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center"
          >
            <Text className="text-sm" style={styles.labelStyle}>
              {item.label}
            </Text>
            <Text className="text-sm text-right flex-1 ml-4" style={styles.valueStyle}>
              {item.value}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  labelStyle: {
    fontFamily: 'Poppins-Medium',
    color: '#888888',
    includeFontPadding: false,
  },
  valueStyle: {
    fontFamily: 'Poppins-Medium',
    color: '#444444',
    includeFontPadding: false,
  },
});
