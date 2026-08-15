import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import PersonalDetailsIcon from '@assets/icons/account/personal_details.svg';
import ChangePassIcon from '@assets/icons/account/change-password/change_pass.svg';
import LogoutIcon from '@assets/icons/account/logout.svg';
import EditIcon from '@assets/icons/edit_icon.svg';
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';
import { logoutPharmacist } from '@shared/services/authService';
import { toTitleCase } from '@shared/utils/stringUtils';
import LogoutConfirmationOverlay from '@shared/components/LogoutConfirmationOverlay';
import FirstTimePasswordModal from '@src/shared/components/FirstTimePasswordModal';

import { useFirstTimePasswordCheck } from '@src/shared/hooks/useFirstTimePasswordCheck';

const Account = () => {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLogoutOverlayVisible, setIsLogoutOverlayVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showFirstTimeModal, closeModal } = useFirstTimePasswordCheck();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setErrorMessage('');
        setLoading(true);
        const response = await getPharmacistProfile();

        if (isMounted) {
          const userProfile = response?.data ?? null;
          setProfile(userProfile);
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
    <View className="flex-1 bg-[#F1F4FF]">
      <View className="m-4 p-6 my-10 rounded-2xl border border-gray-200 bg-white items-center">
        <Text className="text-2xl" style={styles.textSemiBold}>My Profile</Text>

        <View className="items-center mt-4">
          <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden bg-[#48AAD9]">
            <Text className="text-3xl" style={styles.textBold}>
              {initial}
            </Text>
          </View>
          <TouchableOpacity className="w-6 h-6 rounded-full items-center justify-center -mt-3 ml-10">
            <EditIcon width={25} height={25} className="text-white" />
          </TouchableOpacity>
        </View>

        <Text className="text-lg mt-2" style={styles.textSemiBoldDark}>{toTitleCase(displayName)}</Text>
        <Text className="text-sm" style={styles.textLight}>{displayContact}</Text>
        {!!errorMessage && (
          <Text className="text-xs mt-2 text-center" style={styles.errorText}>{errorMessage}</Text>
        )}
      </View>

      {/* Action Cards matching attached design */}
      <TouchableOpacity
        className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => router.push('/tabs/account/PersonalDetails')}
      >
        <PersonalDetailsIcon width={26} height={26} />
        <Text className="flex-1 text-base ml-3.5" style={styles.actionCardText}>Personal Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      <TouchableOpacity
        className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => router.push('/tabs/account/ChangePassword')}
      >
        <ChangePassIcon width={26} height={26} />
        <Text className="flex-1 text-base ml-3.5" style={styles.actionCardText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      <TouchableOpacity
        className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white"
        onPress={() => setIsLogoutOverlayVisible(true)}
      >
        <LogoutIcon width={26} height={26} />
        <Text className="flex-1 text-base ml-3.5" style={styles.actionCardText}>Logout</Text>
        <Ionicons name="chevron-forward" size={20} color="#48AAD9" />
      </TouchableOpacity>

      {/* Modals */}
      <LogoutConfirmationOverlay
        visible={isLogoutOverlayVisible}
        loading={isLoggingOut}
        onClose={() => setIsLogoutOverlayVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      <FirstTimePasswordModal
        visible={showFirstTimeModal}
        onClose={closeModal}
        onChangePassword={() => {
          closeModal();
          router.push('/tabs/account/ChangePassword');
        }}
      />
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  textMedium: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
    includeFontPadding: false,
  },
  textBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
    includeFontPadding: false,
  },
  textSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
    includeFontPadding: false,
  },
  textSemiBoldDark: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
    includeFontPadding: false,
  },
  textLight: {
    fontFamily: 'Poppins-Medium',
    color: '#999',
    includeFontPadding: false,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#CC3A3A',
    includeFontPadding: false,
  },
  actionCardText: {
    fontFamily: 'Poppins-Medium',
    color: '#333333',
    includeFontPadding: false,
  },
});
