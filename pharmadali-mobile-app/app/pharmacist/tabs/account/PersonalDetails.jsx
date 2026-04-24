import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { colors } from '@src/shared/theme/colorPalette'
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';

const PersonalDetails = () => {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setErrorMessage('');
        const response = await getPharmacistProfile();

        if (isMounted) {
          setProfile(response?.data ?? null);
        }
      } catch (error) {
        if (isMounted) {
          setProfile(null);
          setErrorMessage(error?.message || 'Failed to load personal details.');
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const birthday = useMemo(() => {
    const value = profile?.user?.date_of_birth;
    return value || 'Not set';
  }, [profile?.user?.date_of_birth]);

  const contactNumber = profile?.user?.mobile_number || 'Not set';

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
            <Text style={styles.text}>{profile?.user?.first_name || '-'}</Text>
            <Text style={styles.text}>{profile?.user?.last_name || '-'}</Text>
            <Text style={styles.text}>{birthday}</Text>
            <Text style={styles.text}>{contactNumber}</Text>
          </View>
        </View>

        {!!errorMessage && (
          <Text style={styles.errorText} className="mt-4 text-xs text-center">{errorMessage}</Text>
        )}
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
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#CC3A3A',
  },
})
