import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';
import { toTitleCase } from '@shared/utils/stringUtils';

const PersonalDetails = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setErrorMessage('');
        setLoading(true);
        const response = await getPharmacistProfile();

        if (isMounted) {
          setProfile(response?.data ?? null);
        }
      } catch (error) {
        if (isMounted) {
          setProfile(null);
          setErrorMessage(error?.message || 'Failed to load personal details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackText = loading ? 'Loading...' : 'Not Provided';

  const firstName = profile?.user?.first_name ? toTitleCase(profile.user.first_name) : fallbackText;
  const lastName = profile?.user?.last_name ? toTitleCase(profile.user.last_name) : fallbackText;
  const birthday = profile?.user?.date_of_birth || fallbackText;
  const contactNumber = profile?.user?.mobile_number || fallbackText;
  const email = profile?.user?.email || fallbackText;
  const employeeNumber = profile?.user?.employee_number || profile?.employee_number || fallbackText;

  const detailsList = [
    { label: 'First Name', value: firstName },
    { label: 'Last Name', value: lastName },
    { label: 'Birthday', value: birthday },
    { label: 'Contact Number', value: contactNumber },
    { label: 'Email Address', value: email },
    { label: 'Employee Number', value: employeeNumber },
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

        {!!errorMessage && (
          <Text className="mt-2 text-xs text-center" style={styles.errorText}>
            {errorMessage}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
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
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#E53935',
    includeFontPadding: false,
  },
});

