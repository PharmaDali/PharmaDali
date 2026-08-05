import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { colors } from '@src/shared/theme/colorPalette';
import theme from '@src/shared/theme/inputTheme';
import CustomButton from '@src/shared/components/Button';
import DescriptiveLogo from '@src/shared/components/DescriptiveLogo';
import { useConfirmPasswordToggle } from '@src/shared/hooks/confirmPasswordToggle';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resetPasswordWithOtp } from '@src/shared/services/authService';

const CreateNewPasswordFPW = () => {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordToggleIcon = useConfirmPasswordToggle();
  const confirmPasswordToggleIcon = useConfirmPasswordToggle();

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!email || !resetToken) {
      setErrorMessage('Invalid session. Please restart the forgot password process.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp({
        email,
        resetToken,
        password,
        passwordConfirmation: confirmPassword,
      });

      if (Platform.OS === 'web') {
        alert('Password reset successful! You can now log in with your new password.');
        router.replace('/');
      } else {
        Alert.alert(
          'Success',
          'Password reset successful! You can now log in with your new password.',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to reset password. Please try again.';
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
        <View className="border border-gray-300 p-4 rounded-lg w-full bg-white">
          <Text className="text-xl font-semibold p-2 text-center" style={{ color: colors.textColor }}>
            Reset Password
          </Text>

          {errorMessage ? (
            <Text className="text-red-500 text-center my-2 font-semibold">{errorMessage}</Text>
          ) : null}

          <TextInput
            label="New Password"
            mode="outlined"
            autoCapitalize="none"
            secureTextEntry={!passwordToggleIcon.showPassword}
            value={password}
            onChangeText={setPassword}
            style={{ width: '100%', marginBottom: 16, marginTop: 8 }}
            theme={theme}
            right={passwordToggleIcon.icon}
          />
          <TextInput
            label="Confirm New Password"
            mode="outlined"
            autoCapitalize="none"
            secureTextEntry={!confirmPasswordToggleIcon.showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{ width: '100%', marginBottom: 16, marginTop: 8 }}
            theme={theme}
            right={confirmPasswordToggleIcon.icon}
          />
        </View>
        <CustomButton
          className="w-50 mt-4"
          title={loading ? 'Resetting...' : 'I-reset ang password'}
          disabled={loading}
          onPress={handleResetPassword}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateNewPasswordFPW;

const styles = StyleSheet.create({});
