import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DescriptiveLogo from '@src/shared/components/DescriptiveLogo';
import theme from '@src/shared/theme/inputTheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useConfirmPasswordToggle } from '@src/shared/hooks/confirmPasswordToggle';
import { registerCustomer } from '@src/shared/services/authService';
import { validateCustomerRegistration } from '@src/shared/validation/authValidation';
import ToastMessage from '@src/shared/components/ToastMessage';
import { useToast } from '@src/shared/hooks/useToast';
import * as SecureStore from 'expo-secure-store';
import { syncFcmTokenWithBackend } from '@shared/utils/notificationUtils';
import {
  sanitizeNameInput,
  sanitizeNumericInput,
  sanitizeMobileInput,
  stripEmojis,
  sanitizeNoEmoji,
} from '@src/shared/utils/inputSanitizers';

const Register = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const passwordToggleIcon = useConfirmPasswordToggle();
  const confirmPasswordToggleIcon = useConfirmPasswordToggle();
  const { toast, showSuccess } = useToast();

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleRegister = async () => {
    const credentials = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      mobileNumber,
      dateOfBirth,
      address,
    };

    const validationMessage = validateCustomerRegistration(credentials);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await registerCustomer({
        credentials: {
          ...credentials,
          dateOfBirth: formatDateForApi(dateOfBirth),
        },
      });

      const token = response?.token || response?.data?.token;
      if (token) {
        await SecureStore.setItemAsync('customer_token', JSON.stringify(token));
        syncFcmTokenWithBackend().catch(() => {});
      }

      showSuccess('Registration successful! Welcome to PharmaDali.');

      setTimeout(() => {
        router.replace(token ? '/tabs/Home' : '/');
      }, 1500);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      edges={['top', 'bottom']}
    >
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={Platform.OS === 'ios' ? 12 : 16}
        useSafeAreaTop={true}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : (isKeyboardVisible ? 'padding' : undefined)}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 24}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: isKeyboardVisible ? 40 : 24,
            flexGrow: 1,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <DescriptiveLogo />

          <View className="w-full border border-gray-300 p-4 rounded-xl mt-2 bg-white">
            <View className="mb-3 items-center">
              <Text variant="headlineSmall" className="font-bold text-slate-800">Register</Text>
            </View>
            <TextInput
              label="First Name"
              mode="outlined"
              theme={theme}
              value={firstName}
              onChangeText={(text) => setFirstName(sanitizeNameInput(text, 50))}
              maxLength={50}
              editable={!isSubmitting}
              style={{ marginBottom: 16 }}
            />
            <TextInput
              label="Last Name"
              mode="outlined"
              theme={theme}
              value={lastName}
              onChangeText={(text) => setLastName(sanitizeNameInput(text, 50))}
              maxLength={50}
              editable={!isSubmitting}
              style={{ marginBottom: 16 }}
            />
            <View className="mb-2">
              <TextInput
                label="Email"
                mode="outlined"
                keyboardType='email-address'
                theme={theme}
                value={email}
                onChangeText={(text) => setEmail(stripEmojis(text))}
                maxLength={100}
                autoCapitalize='none'
                editable={!isSubmitting}
                style={{ marginBottom: 16 }}
              />
              <Pressable onPress={() => !isSubmitting && setShowDatePicker(true)}>
                <TextInput
                  label="Date of Birth"
                  mode="outlined"
                  theme={theme}
                  value={formatDate(dateOfBirth)}
                  placeholder="e.g. 01/15/1990"
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => !isSubmitting && setShowDatePicker(true)}
                    />
                  }
                />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth ?? (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; })()}
                  mode="date"
                  display="default"
                  minimumDate={new Date(1900, 0, 1)}
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                    }
                  }}
                />
              )}
              <TextInput
                label="Mobile Number"
                mode="outlined"
                keyboardType='phone-pad'
                theme={theme}
                style={{ marginTop: 16 }}
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(sanitizeMobileInput(text))}
                maxLength={13}
                editable={!isSubmitting}
              />
              <TextInput
                label="Address"
                mode="outlined"
                theme={theme}
                style={{ marginTop: 16 }}
                value={address}
                onChangeText={(text) => setAddress(sanitizeNoEmoji(text, 150))}
                maxLength={150}
                editable={!isSubmitting}
              />
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry={!passwordToggleIcon.showPassword}
                theme={theme}
                value={password}
                onChangeText={(text) => setPassword(stripEmojis(text))}
                maxLength={64}
                style={{ marginTop: 16 }}
                right={passwordToggleIcon.icon}
                autoCapitalize='none'
                editable={!isSubmitting}
              />
              <TextInput
                label="Confirm Password"
                mode="outlined"
                secureTextEntry={!confirmPasswordToggleIcon.showPassword}
                theme={theme}
                style={{ marginTop: 16 }}
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(stripEmojis(text))}
                maxLength={64}
                right={confirmPasswordToggleIcon.icon}
                autoCapitalize='none'
                editable={!isSubmitting}
              />
              {!!errorMessage && <Text className="text-[#E53935] text-xs mt-3 text-center">{errorMessage}</Text>}
            </View>
          </View>
          <Button
            mode="contained"
            style={{ marginTop: 16, borderRadius: 12, width: '100%' }}
            buttonColor="#48AAD9"
            textColor="#FFFFFF"
            onPress={handleRegister}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Mag-Register
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Register;

