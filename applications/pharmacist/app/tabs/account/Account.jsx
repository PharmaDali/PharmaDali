import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette'
import AccountIcon from '@assets/icons/account_icon.svg'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import EditIcon from '@assets/icons/edit_icon.svg'
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';
import { logoutPharmacist } from '@shared/services/authService';
import { toTitleCase } from '@shared/utils/stringUtils';
import LogoutConfirmationOverlay from '@shared/components/LogoutConfirmationOverlay';

const Account = () => {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLogoutOverlayVisible, setIsLogoutOverlayVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          setErrorMessage(error?.message || 'Failed to load profile.');
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

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutPharmacist();
      setIsLogoutOverlayVisible(false);
      router.replace('/auth/PharmacistLogin');
    } catch {
      setIsLogoutOverlayVisible(false);
      router.replace('/auth/PharmacistLogin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const firstName = profile?.user?.first_name ?? '';
  const lastName = profile?.user?.last_name ?? '';
  const fullName = useMemo(() => {
    const value = `${firstName} ${lastName}`.trim();
    return value || 'Pharmacist';
  }, [firstName, lastName]);

  const contactNumber = profile?.user?.mobile_number || 'No contact number';
  const initial = loading ? '' : (firstName || fullName || 'P').charAt(0).toUpperCase();
  const displayName = loading ? 'Loading profile...' : fullName;
  const displayContact = loading ? 'Loading contact...' : contactNumber;

  return (
    <View style={styles.container}>
      <View style={styles.card} className="m-4 p-6 my-10 rounded-xl border border-gray-200 items-center">
        <Text style={styles.textSemiBold} className="text-2xl">My Profile</Text>

        <View className="items-center mt-4">
          <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
            style={styles.defaultPicture}>
            <Text style={styles.textBold} className="text-3xl">
              {initial}
            </Text>
          </View>
          <TouchableOpacity className="w-6 h-6 rounded-full items-center justify-center -mt-3 ml-10">
            <EditIcon width={25} height={25} className="text-white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.textSemiBoldDark} className="text-lg mt-2">{toTitleCase(displayName)}</Text>
        <Text style={styles.textLight} className="text-sm">{displayContact}</Text>
        {!!errorMessage && (
          <Text style={styles.errorText} className="text-xs mt-2 text-center">{errorMessage}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.card}
        className="mx-4 px-4 py-4 rounded-xl border border-gray-200 flex-row items-center"
        onPress={() => router.push('/tabs/account/PersonalDetails')}
      >
        <AccountIcon width={28} height={28} />
        <Text style={styles.textMedium} className="flex-1 text-base ml-3">Personal Details</Text>
        <ArrowForwardIcon width={18} height={18} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        className="mx-4 mt-3 px-4 py-4 rounded-xl border border-red-200 flex-row items-center bg-red-50/20"
        onPress={() => setIsLogoutOverlayVisible(true)}
      >
        <View className="w-7 h-7 rounded-full bg-red-100 items-center justify-center">
          <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
        </View>
        <Text className="flex-1 text-base ml-3 text-red-500 font-semibold" style={{ fontFamily: 'Poppins-Medium' }}>
          Log Out
        </Text>
        <ArrowForwardIcon width={18} height={18} />
      </TouchableOpacity>

      <LogoutConfirmationOverlay
        visible={isLogoutOverlayVisible}
        loading={isLoggingOut}
        onClose={() => setIsLogoutOverlayVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </View>
  )
}

export default Account

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  textMedium: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  textBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  textSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  textSemiBoldDark: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  textLight: {
    fontFamily: 'Poppins-Medium',
    color: '#999',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#CC3A3A',
  },
  card: {
    backgroundColor: '#fff',
  },
  defaultPicture: {
    backgroundColor: colors.primary,
  },
})
