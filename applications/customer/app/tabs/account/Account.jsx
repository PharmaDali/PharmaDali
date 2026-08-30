import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { colors } from '@src/shared/theme/colorPalette'
import PersonalDetailsIcon from '@assets/icons/account/personal_details.svg'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import EditIcon from '@assets/icons/edit_icon.svg'
import { useProfile } from '@src/shared/hooks/useProfile';
import { toTitleCase } from '@src/shared/utils/stringUtils';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { logoutCustomer } from '@shared/services/authService'
import LogoutOverlay from '@shared/components/LogoutOverlay'
import LogoutIcon from '@assets/icons/account/logout.svg'
import ChangePassIcon from '@assets/icons/account/change-password/change_pass.svg'

const Account = () => {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [isLogoutOverlayVisible, setIsLogoutOverlayVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
      setIsLogoutOverlayVisible(false);
      router.replace('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { first_name, last_name, mobile_number } = profile || {};
  const initials = first_name ? first_name.charAt(0).toUpperCase() : '';

  return (
    <View style={styles.container}>
      <View style={styles.card} className="m-4 p-6 my-10 rounded-xl border border-gray-200 items-center">
        <Text style={styles.textSemiBold} className="text-2xl">My Profile</Text>

        <View className="items-center mt-4">
          <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden"
            style={styles.defaultPicture}>
            <Text style={styles.textBold} className="text-3xl">
              {initials}
            </Text>
          </View>
          <TouchableOpacity className="w-6 h-6 rounded-full items-center justify-center -mt-3 ml-10">
            <EditIcon width={25} height={25} className="text-white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.textSemiBoldDark} className="text-lg mt-2">{toTitleCase(first_name)} {toTitleCase(last_name)}</Text>
        <Text style={styles.textLight} className="text-sm">{mobile_number}</Text>
      </View>

      <TouchableOpacity
        className="mx-4 mb-3 mt-4 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => router.push('/tabs/account/PersonalDetails')}
      >
        <PersonalDetailsIcon width={26} height={26} />
        <Text style={styles.textMedium} className="flex-1 text-base ml-3.5">Personal Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      <TouchableOpacity
        className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => router.push('/tabs/account/ChangePassword')}
      >
        <ChangePassIcon width={26} height={26} />
        <Text style={styles.textMedium} className="flex-1 text-base ml-3.5">Change Password</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      <TouchableOpacity
        className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => setIsLogoutOverlayVisible(true)}
      >
        <LogoutIcon width={26} height={26} />
        <Text style={styles.textMedium} className="flex-1 text-base ml-3.5">Logout</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      <LogoutOverlay
        visible={isLogoutOverlayVisible}
        onClose={() => {
          if (!isLoggingOut) {
            setIsLogoutOverlayVisible(false);
          }
        }}
        onConfirm={handleLogout}
        submitting={isLoggingOut}
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
  card: {
    backgroundColor: '#fff',
  },
  defaultPicture: {
    backgroundColor: colors.primary,
  },
})

