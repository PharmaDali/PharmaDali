import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import CustomButton from '@src/shared/components/Button';
import { colors } from '@src/shared/theme/colorPalette';
import DescriptiveLogo from '@src/shared/components/DescriptiveLogo';
import { useRouter } from 'expo-router';
import theme from '@src/shared/theme/inputTheme';
import { sendForgotPasswordOtp } from '@src/shared/services/authService';

const EnterMobileNumber = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp({ email: trimmedEmail });
      router.push({
        pathname: '/auth/EnterOTPFPW',
        params: { email: trimmedEmail },
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to send OTP. Please check your email and try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        className="w-full"
        contentContainerStyle={{ padding: 16, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <DescriptiveLogo />
        <Text className="text-center mb-4 text-base" style={{ color: colors.textColor }}>
          Enter your registered email address to receive a password reset OTP.
        </Text>

        {errorMessage ? (
          <Text className="text-red-500 text-center mb-3 font-semibold">{errorMessage}</Text>
        ) : null}

        <TextInput
          label="Email Address"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          theme={theme}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <CustomButton
          className="mt-4 w-40"
          title={loading ? 'Sending OTP...' : 'I-submit'}
          disabled={loading}
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EnterMobileNumber;

const styles = StyleSheet.create({});
