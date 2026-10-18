import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Animated } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import PersonalDetailsIcon from '@assets/icons/account/personal_details.svg';
import ChangePassIcon from '@assets/icons/account/change-password/change_pass.svg';
import LogoutIcon from '@assets/icons/account/logout.svg';
import { getPharmacistProfile, updatePharmacistDutyStatus } from '@shared/services/pharmacistProfileService';
import { logoutPharmacist } from '@shared/services/authService';
import { toTitleCase } from '@shared/utils/stringUtils';
import LogoutConfirmationOverlay from '@shared/components/LogoutConfirmationOverlay';
import DutyStatusConfirmationOverlay from '@shared/components/DutyStatusConfirmationOverlay';
import FirstTimePasswordModal from '@src/shared/components/FirstTimePasswordModal';

import { useFirstTimePasswordCheck } from '@src/shared/hooks/useFirstTimePasswordCheck';

const SkeletonBlock = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E2E8F0', opacity },
        style,
      ]}
    />
  );
};

const Account = () => {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdatingDuty, setIsUpdatingDuty] = useState(false);
  const [pendingDutyValue, setPendingDutyValue] = useState(null);
  const [isLogoutOverlayVisible, setIsLogoutOverlayVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showFirstTimeModal, closeModal } = useFirstTimePasswordCheck();

  const loadProfile = useCallback(async (showSpinner = false) => {
    try {
      setErrorMessage('');
      if (showSpinner) {
        setLoading(true);
      }
      const response = await getPharmacistProfile();
      const userProfile = response?.data ?? null;
      setProfile(userProfile);
    } catch (error) {
      setProfile(null);
      setErrorMessage(error?.message || 'Failed to load profile.');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProfile(true);
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile(false);
    }, [loadProfile])
  );

  const isPharmacyOpen = Boolean(profile && (profile?.is_pharmacy_open ?? profile?.pharmacy?.is_open ?? true));
  const isOnDuty = Boolean(profile && isPharmacyOpen && (profile?.is_on_duty ?? true));

  const handleToggleDuty = (nextValue) => {
    if (!isPharmacyOpen && nextValue) {
      setErrorMessage('Cannot go in duty while the pharmacy is closed.');
      return;
    }
    setErrorMessage('');
    setPendingDutyValue(Boolean(nextValue));
  };

  const handleConfirmDutyToggle = async () => {
    if (pendingDutyValue === null) return;
    const nextValue = Boolean(pendingDutyValue);
    if (!isPharmacyOpen && nextValue) {
      setErrorMessage('Cannot go in duty while the pharmacy is closed.');
      setPendingDutyValue(null);
      return;
    }
    const previousDuty = isOnDuty;
    setErrorMessage('');
    setIsUpdatingDuty(true);
    try {
      const response = await updatePharmacistDutyStatus(nextValue);
      if (response?.data && typeof response.data.is_on_duty === 'boolean') {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_on_duty: response.data.is_on_duty,
                is_pharmacy_open: response.data.is_pharmacy_open ?? prev.is_pharmacy_open,
                duty_updated_at: response.data.duty_updated_at ?? prev.duty_updated_at,
              }
            : prev
        );
      } else {
        setProfile((prev) => (prev ? { ...prev, is_on_duty: nextValue } : prev));
      }
      setPendingDutyValue(null);
    } catch (error) {
      setProfile((prev) => (prev ? { ...prev, is_on_duty: isPharmacyOpen ? previousDuty : false } : prev));
      setErrorMessage(error?.message || 'Failed to update duty status.');
      setPendingDutyValue(null);
    } finally {
      setIsUpdatingDuty(false);
    }
  };

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
    return value;
  }, [firstName, lastName]);

  const contactNumber = profile?.user?.mobile_number || '';
  const initial = loading || !profile ? '' : (firstName || fullName || 'P').charAt(0).toUpperCase();
  const displayName = loading ? '' : fullName;
  const displayContact = loading ? '' : contactNumber;

  return (
    <ScrollView className="flex-1 bg-[#F1F4FF]" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="mx-4 mt-4 mb-3 p-6 rounded-2xl border border-gray-200 bg-white items-center">
        <Text className="text-2xl" style={styles.textSemiBold}>My Profile</Text>

        {loading ? (
          <View className="items-center mt-4">
            <SkeletonBlock width={80} height={80} borderRadius={40} />
            <SkeletonBlock width={140} height={18} borderRadius={6} style={{ marginTop: 12 }} />
            <SkeletonBlock width={105} height={13} borderRadius={6} style={{ marginTop: 8 }} />
            <SkeletonBlock width={86} height={24} borderRadius={12} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <>
            <View className="items-center mt-4">
              <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden bg-[#48AAD9]">
                <Text className="text-3xl" style={styles.textBold}>
                  {initial}
                </Text>
              </View>
            </View>

            {Boolean(displayName) && (
              <Text className="text-lg mt-2" style={styles.textSemiBoldDark}>{toTitleCase(displayName)}</Text>
            )}
            {Boolean(displayContact) && (
              <Text className="text-sm" style={styles.textLight}>{displayContact}</Text>
            )}

            {profile && (
              <View
                className={`mt-2.5 px-3 py-1 rounded-full flex-row items-center ${
                  isOnDuty ? 'bg-[#E8F8FF] border border-[#BAE6FD]' : 'bg-slate-100 border border-slate-200'
                }`}
              >
                <View
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    isOnDuty ? 'bg-[#48AAD9]' : 'bg-slate-400'
                  }`}
                />
                <Text
                  className={`text-xs ${isOnDuty ? 'text-[#48AAD9]' : 'text-slate-600'}`}
                  style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
                >
                  {isOnDuty ? 'In Duty' : 'Out of Duty'}
                </Text>
              </View>
            )}
          </>
        )}

        {!!errorMessage && (
          <Text className="text-xs mt-2 text-center" style={styles.errorText}>{errorMessage}</Text>
        )}
      </View>

      {/* Shift Duty Status Toggle Card */}
      <View className="mx-4 mb-3 px-4 py-3.5 rounded-2xl border border-[#E2E8F0] flex-row items-center bg-white">
        <View className="w-[26px] h-[26px] items-center justify-center">
          <Ionicons
            name="time-outline"
            size={24}
            color="#444444"
          />
        </View>
        <View className="flex-1 ml-3.5">
          <Text className="text-base" style={styles.actionCardText}>
            Shift Duty Status
          </Text>
          {loading || !profile ? (
            <SkeletonBlock width={115} height={12} borderRadius={6} style={{ marginTop: 4 }} />
          ) : (
            <Text className="text-xs text-[#999999]" style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}>
              {!isPharmacyOpen
                ? 'Out of Duty (Store Closed)'
                : isOnDuty
                ? 'Currently In Duty'
                : 'Currently Out of Duty'}
            </Text>
          )}
        </View>
        {loading || !profile ? (
          <SkeletonBlock width={46} height={26} borderRadius={13} />
        ) : (
          <Switch
            value={isOnDuty}
            onValueChange={handleToggleDuty}
            disabled={isUpdatingDuty || !isPharmacyOpen}
            trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
            thumbColor={isOnDuty ? '#48AAD9' : '#94A3B8'}
          />
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
      <DutyStatusConfirmationOverlay
        visible={pendingDutyValue !== null}
        targetDutyStatus={Boolean(pendingDutyValue)}
        loading={isUpdatingDuty}
        onClose={() => {
          if (!isUpdatingDuty) setPendingDutyValue(null);
        }}
        onConfirm={handleConfirmDutyToggle}
      />

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
    </ScrollView>
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
