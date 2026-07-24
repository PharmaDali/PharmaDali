import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import DescriptiveLogo from '@src/shared/components/DescriptiveLogo';
import React, { useRef, useState, useEffect } from 'react';
import { colors } from '@src/shared/theme/colorPalette';
import CustomButton from '@src/shared/components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyForgotPasswordOtp, sendForgotPasswordOtp } from '@src/shared/services/authService';

const EnterOTPFPW = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef([]);
  const router = useRouter();
  const { email } = useLocalSearchParams();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChangeText = (text, index) => {
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (!email) {
      setErrorMessage('Email address is missing. Please restart the process.');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyForgotPasswordOtp({ email, otp: fullOtp });
      const resetToken = response.reset_token;

      router.push({
        pathname: '/auth/CreateNewPasswordFPW',
        params: { email, resetToken },
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Invalid or expired OTP code.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !email) return;

    setErrorMessage('');
    setResending(true);
    try {
      await sendForgotPasswordOtp({ email });
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to resend OTP.';
      setErrorMessage(msg);
    } finally {
      setResending(false);
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
        contentContainerStyle={{ padding: 16, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <DescriptiveLogo />

        <Text className="text-2xl font-semibold text-center mt-10" style={{ color: colors.textColor }}>
          Forgot your password?
        </Text>
        <Text className="text-center mt-2" style={{ color: colors.textColor }}>
          We sent a 6-digit OTP to <Text className="font-bold">{email || 'your registered email'}</Text> to reset your password. (Valid for 5 minutes)
        </Text>

        {errorMessage ? (
          <Text className="text-red-500 text-center mt-4 font-semibold">{errorMessage}</Text>
        ) : null}

        <Text className="text-center mt-8 text-xl font-semibold" style={{ color: colors.textColor }}>
          Enter the 6-digit code:
        </Text>

        <View className="flex-row justify-between mt-4 w-full px-4 gap-2">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              className="flex-1 min-w-[40px] max-w-[60px] aspect-square border border-gray-400 rounded-lg text-center text-lg font-semibold bg-white"
              style={{ color: colors.textColor }}
            />
          ))}
        </View>

        <View className="mt-6 items-center">
          <Text className="text-center font-semibold" style={{ color: colors.textColor }}>
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity
            disabled={resendCooldown > 0 || resending}
            onPress={handleResendOtp}
            className="mt-1"
          >
            <Text
              style={{
                color: resendCooldown > 0 || resending ? '#9CA3AF' : colors.buttonColor,
                fontWeight: 'bold',
              }}
            >
              {resending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          className="mt-6 w-50"
          title={loading ? 'Verifying...' : 'I-submit ang code'}
          disabled={loading}
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EnterOTPFPW;

const styles = StyleSheet.create({});
