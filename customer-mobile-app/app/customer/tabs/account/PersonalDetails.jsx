import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '@src/shared/theme/colorPalette'
import { getCustomerProfile } from '@src/shared/services/customerProfileService';
import { toTitleCase } from '@src/shared/utils/stringUtils';

const PersonalDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        const result = await getCustomerProfile();
        if (isMounted && result.status === 'success') {
          setProfile(result.data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View className="items-center justify-center mt-10 bg-white border border-gray-300 rounded-xl px-4 py-6 mx-4">
        <Text style={styles.title} className="mb-2 text-2xl">Personal Details</Text>
        <View className="flex-row justify-between mt-4">
          <View>
            <Text style={styles.labelText}>First Name: </Text>
            <Text style={styles.labelText}>Last Name: </Text>
            <Text style={styles.labelText}>Birthday: </Text>
            <Text style={styles.labelText}>Contact Number: </Text>
          </View>
          <View>
            <Text style={styles.text}>{toTitleCase(profile?.first_name) || 'N/A'}</Text>
            <Text style={styles.text}>{toTitleCase(profile?.last_name) || 'N/A'}</Text>
            <Text style={styles.text}>{profile?.date_of_birth || 'N/A'}</Text>
            <Text style={styles.text}>{profile?.mobile_number || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PersonalDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  title:{
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  labelText: {
    fontFamily: 'Poppins-Medium',
    color: '#888888',
  },
})
