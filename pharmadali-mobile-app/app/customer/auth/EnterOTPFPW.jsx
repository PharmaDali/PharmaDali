import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TextInput, } from 'react-native'
import { Link } from 'expo-router'
import DescriptiveLogo from '@shared/components/DescriptiveLogo';
import React, { useRef, useState } from 'react'
import { colors } from '@shared/colorPallete';
import CustomButton from '@shared/components/Button';
import { useRouter } from 'expo-router';

const EnterOTPFPW = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const router = useRouter();

  const handleChangeText = (text, index) => {
    // Validate inputs to allow only numbers
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
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView className="w-full"
        contentContainerStyle={{ padding: 16, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}>

        <DescriptiveLogo />

        <Text className="text-2xl font-semibold text-center mt-10" style={{ color: colors.textColor }}>Forgot your password?</Text>
        <Text className="text-center" style={{ color: colors.textColor }}>We sent an OTP to your saved mobile number to reset your password.</Text>
        <Text className="text-center mt-20 text-xl font-semibold" style={{ color: colors.textColor }}>Enter the 6-digit code.</Text>

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

        <Text className="text-center mt-5 font-semibold" style={{ color: colors.textColor }}>
          Didn't receive the code? <Link href="#" className="text-blue-400" style={{ color: colors.buttonColor }}>Resend OTP</Link>
        </Text>
        <CustomButton className="mt-4 w-50" title="I-submit ang code" onPress={() => {
          router.push('/customer/auth/CreateNewPasswordFPW');
        }} />

      </ScrollView>
    </KeyboardAvoidingView>

  )
}

export default EnterOTPFPW

const styles = StyleSheet.create({

})