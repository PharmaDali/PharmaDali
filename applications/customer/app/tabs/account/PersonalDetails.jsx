import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@src/shared/theme/colorPalette';
import { useProfile } from '@src/shared/hooks/useProfile';
import { updateCustomerProfile } from '@src/shared/services/customerProfileService';
import { toTitleCase } from '@src/shared/utils/stringUtils';
import {
  sanitizeNameInput,
  sanitizeMobileInput,
  sanitizeNoEmoji,
  MOBILE_REGEX,
} from '@src/shared/utils/inputSanitizers';
import { useToast } from '@src/shared/hooks/useToast';
import ToastMessage from '@src/shared/components/ToastMessage';

const PersonalDetails = () => {
  const router = useRouter();
  const { profile, loading, refetchProfile } = useProfile();
  const { toast, showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync form inputs when profile loads or when entering edit mode
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setContactNumber(profile.mobile_number || '');
      setAddress(profile.address || '');
      if (profile.date_of_birth) {
        const parsed = new Date(profile.date_of_birth);
        setDateOfBirth(!isNaN(parsed.getTime()) ? parsed : null);
      } else {
        setDateOfBirth(null);
      }
    }
  }, [profile, isEditing]);

  const formatDateForDisplay = (date) => {
    if (!date) return 'Not Provided';
    if (typeof date === 'string') return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForApi = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleStartEdit = () => {
    setFormError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setFormError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedMobile = contactNumber.trim();
    const trimmedAddress = address.trim();

    if (!trimmedFirst) {
      setFormError('First name is required.');
      return;
    }

    if (!trimmedLast) {
      setFormError('Last name is required.');
      return;
    }

    if (!trimmedMobile) {
      setFormError('Contact number is required.');
      return;
    }

    if (!MOBILE_REGEX.test(trimmedMobile)) {
      setFormError('Contact number must be an 11-digit Philippine number starting with 09.');
      return;
    }

    if (dateOfBirth) {
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (dateOfBirth > eighteenYearsAgo) {
        setFormError('You must be at least 18 years old.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateCustomerProfile({
        first_name: trimmedFirst,
        last_name: trimmedLast,
        mobile_number: trimmedMobile,
        date_of_birth: formatDateForApi(dateOfBirth),
        address: trimmedAddress || null,
      });

      await refetchProfile();
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update personal details.';
      setFormError(msg);
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fallbackText = 'Not Provided';
  const displayFirstName = profile?.first_name ? toTitleCase(profile.first_name) : fallbackText;
  const displayLastName = profile?.last_name ? toTitleCase(profile.last_name) : fallbackText;
  const displayBirthday = profile?.date_of_birth || fallbackText;
  const displayContact = profile?.mobile_number || fallbackText;
  const displayAddress = profile?.address || fallbackText;
  const displayEmail = profile?.email || fallbackText;

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ToastMessage visible={toast.visible} message={toast.message} type={toast.type} />

      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#F0F0F0]">
        <TouchableOpacity className="p-1" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#48AAD9" />
        </TouchableOpacity>
        <Text className="text-lg text-[#48AAD9]" style={{ fontFamily: 'Poppins-Bold' }}>
          Personal Details
        </Text>
        <TouchableOpacity
          className="p-1"
          onPress={isEditing ? handleCancelEdit : handleStartEdit}
          disabled={isSaving}
        >
          <Text className="text-sm text-[#48AAD9]" style={{ fontFamily: 'Poppins-SemiBold' }}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <View>
            <View className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center shadow-xs">
              <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>First Name</Text>
              <Text className="text-sm text-[#444444] text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayFirstName}</Text>
            </View>

            <View className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center shadow-xs">
              <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>Last Name</Text>
              <Text className="text-sm text-[#444444] text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayLastName}</Text>
            </View>

            <View className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center shadow-xs">
              <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>Birthday</Text>
              <Text className="text-sm text-[#444444] text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayBirthday}</Text>
            </View>

            <View className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center shadow-xs">
              <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>Contact Number</Text>
              <Text className="text-sm text-[#444444] text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayContact}</Text>
            </View>

            <View className="w-full bg-white border border-[#D0D5DD] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center shadow-xs">
              <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>Address</Text>
              <Text className="text-sm text-[#444444] text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayAddress}</Text>
            </View>

            <View className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-4 mb-3.5 flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                <Text className="text-sm text-[#888888]" style={{ fontFamily: 'Poppins-Medium' }}>Email Address</Text>
              </View>
              <Text className="text-sm text-slate-600 text-right flex-1 ml-4" style={{ fontFamily: 'Poppins-Medium' }}>{displayEmail}</Text>
            </View>

            <TouchableOpacity
              className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center justify-center mt-6 shadow-sm flex-row gap-2"
              onPress={handleStartEdit}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text className="text-white text-base" style={{ fontFamily: 'Poppins-Bold' }}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ================= EDIT MODE ================= */
          <View>
            {/* First Name Input */}
            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-1.5" style={{ fontFamily: 'Poppins-SemiBold' }}>
                First Name *
              </Text>
              <TextInput
                value={firstName}
                onChangeText={(text) => setFirstName(sanitizeNameInput(text, 50))}
                placeholder="Enter first name"
                placeholderTextColor="#94A3B8"
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-slate-800 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
                maxLength={50}
              />
            </View>

            {/* Last Name Input */}
            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-1.5" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Last Name *
              </Text>
              <TextInput
                value={lastName}
                onChangeText={(text) => setLastName(sanitizeNameInput(text, 50))}
                placeholder="Enter last name"
                placeholderTextColor="#94A3B8"
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-slate-800 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
                maxLength={50}
              />
            </View>

            {/* Contact Number Input */}
            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-1.5" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Contact Number *
              </Text>
              <TextInput
                value={contactNumber}
                onChangeText={(text) => setContactNumber(sanitizeMobileInput(text))}
                placeholder="09XXXXXXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-slate-800 text-sm"
                style={{ fontFamily: 'Poppins-Regular' }}
                maxLength={11}
              />
            </View>

            {/* Birthday Input */}
            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-1.5" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Birthday
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-3 flex-row justify-between items-center"
              >
                <Text
                  className={`text-sm ${dateOfBirth ? 'text-slate-800' : 'text-[#94A3B8]'}`}
                  style={{ fontFamily: 'Poppins-Regular' }}
                >
                  {dateOfBirth ? formatDateForDisplay(dateOfBirth) : 'Select date of birth'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#48AAD9" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Address Input */}
            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-1.5" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Address
              </Text>
              <TextInput
                value={address}
                onChangeText={(text) => setAddress(sanitizeNoEmoji(text, 150))}
                placeholder="Enter delivery / residential address"
                placeholderTextColor="#94A3B8"
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-slate-800 text-sm min-h-[48px]"
                style={{ fontFamily: 'Poppins-Regular' }}
                maxLength={150}
              />
            </View>

            {/* Email Address (LOCKED) */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-xs text-slate-600" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Email Address
                </Text>
                <View className="flex-row items-center bg-slate-200 px-2 py-0.5 rounded-full">
                  <Ionicons name="lock-closed" size={11} color="#64748B" />
                  <Text className="text-[11px] text-slate-500 font-medium ml-1" style={{ fontFamily: 'Poppins-Medium' }}>
                    Locked
                  </Text>
                </View>
              </View>
              <View className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl px-3.5 py-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-600" style={{ fontFamily: 'Poppins-Medium' }}>
                  {displayEmail}
                </Text>
                <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
              </View>
              <Text className="text-[11px] text-[#94A3B8] mt-1" style={{ fontFamily: 'Poppins-Regular' }}>
                Email address is permanently linked to your account and cannot be modified.
              </Text>
            </View>

            {/* Form Error Feedback */}
            {!!formError && (
              <View className="p-3 bg-red-50 rounded-lg mb-4 border border-red-200">
                <Text className="text-xs text-red-600" style={{ fontFamily: 'Poppins-Medium' }}>
                  {formError}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-white border border-[#D0D5DD] rounded-xl py-3.5 items-center justify-center"
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text className="text-sm text-slate-600" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-[#48AAD9] rounded-xl py-3.5 items-center justify-center shadow-sm"
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-Bold' }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalDetails;
