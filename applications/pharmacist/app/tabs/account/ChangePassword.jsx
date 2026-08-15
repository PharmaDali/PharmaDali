import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  ScrollView,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChangePassHeroIcon from '@assets/icons/account/change-password/change_pass_hero.svg';
import SuccessIcon from '@assets/icons/account/change-password/success.svg';
import PasswordInput from '@src/shared/components/PasswordInput';
import OtpVerifiedModal from '@src/shared/components/OtpVerifiedModal';
import { getPharmacistProfile } from '@shared/services/pharmacistProfileService';
import {
  sendPharmacistChangePasswordOtp,
  verifyPharmacistChangePasswordOtp,
  resetPharmacistPassword,
} from '@shared/services/authService';

const ChangePassword = () => {
  const router = useRouter();

  // Current step: 1 = Send OTP, 2 = Verify OTP, 4 = New Password, 5 = Password Updated Tab
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Step 2 State (OTP 6 digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [resendTimer, setResendTimer] = useState(45);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Step 4 State (New Password)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const displayEmail = email || (emailLoading ? 'Loading registered email...' : 'Email Not Provided');

  // Load logged-in pharmacist profile email on mount
  useEffect(() => {
    let isMounted = true;
    getPharmacistProfile()
      .then((res) => {
        if (isMounted && res?.data?.user?.email) {
          setEmail(res.data.user.email);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setEmailLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Block back navigation for Step 4 & Step 5
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 4 || step === 5) {
        // Prevent going back to OTP verification or previous step
        return true;
      }
      if (step === 2) {
        setStep(1);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [step]);

  // Timer countdown for Step 2
  useEffect(() => {
    let interval = null;
    if (step === 2 && isResendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [step, isResendDisabled, resendTimer]);

  const handleSendOtp = async () => {
    setApiError('');
    if (!email) {
      setApiError('No registered email address found for this account.');
      return;
    }
    setLoading(true);
    try {
      await sendPharmacistChangePasswordOtp(email);
      setStep(2);
      setResendTimer(45);
      setIsResendDisabled(true);
    } catch (err) {
      setApiError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    setApiError('');
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next box
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setApiError('');
    if (!email) {
      setApiError('No registered email address found.');
      return;
    }
    setResendTimer(45);
    setIsResendDisabled(true);
    try {
      await sendPharmacistChangePasswordOtp(email);
    } catch (err) {
      setApiError(err?.message || 'Failed to resend OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setApiError('');
    if (!email) {
      setApiError('No registered email address found.');
      return;
    }
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setApiError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPharmacistChangePasswordOtp(email, otpCode);
      const token = res?.reset_token || res?.data?.reset_token;
      if (token) {
        setResetToken(token);
        setShowVerifiedModal(true);
      } else {
        setApiError('Failed to retrieve reset token.');
      }
    } catch (err) {
      setApiError(err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifiedModalContinue = () => {
    setShowVerifiedModal(false);
    setStep(4);
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPharmacistPassword({
        email,
        resetToken,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });
      setStep(5);
    } catch (err) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `(${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')})`;
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return 'Change Password';
      case 2:
        return 'Verify OTP';
      case 4:
        return 'Create New Password';
      case 5:
        return 'Password Updated';
      default:
        return 'Change Password';
    }
  };

  const handleBackPress = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
        {step === 1 || step === 2 ? (
          <TouchableOpacity className="p-1" onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color="#48AAD9" />
          </TouchableOpacity>
        ) : (
          <View className="w-6" />
        )}
        <Text className="text-lg" style={styles.headerTitle}>
          {getHeaderTitle()}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* STEP 1: SEND OTP */}
        {step === 1 && (
          <View className="items-center w-full">
            <View className="items-center justify-center my-6">
              <ChangePassHeroIcon width={130} height={130} />
            </View>

            <Text className="text-xs text-center leading-5 mb-6" style={styles.descriptionText}>
              For your security, we will send a One-Time Password (OTP) to your registered email address
            </Text>

            <View className="w-full flex-row items-center border border-[#E2E8F0] rounded-2xl p-4 mb-4 bg-white">
              <Ionicons name="mail-outline" size={24} color="#333333" className="mr-3" />
              <View className="flex-1 ml-2">
                <Text className="text-base" style={styles.emailText}>{displayEmail}</Text>
                <Text className="text-[11px] mt-0.5" style={styles.emailSubtext}>Registered email address</Text>
              </View>
            </View>

            {!!apiError && (
              <Text className="text-xs mb-4 text-center" style={styles.errorText}>{apiError}</Text>
            )}

            <TouchableOpacity className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center" onPress={handleSendOtp} disabled={loading || emailLoading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-base" style={styles.primaryButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <View className="items-center w-full">
            <Text className="text-sm mb-1" style={styles.otpDescriptionLabel}>We sent an OTP to</Text>
            <Text className="text-base mb-8" style={styles.otpEmailText}>{displayEmail}</Text>

            {/* 6-Digit PIN input boxes */}
            <View className="flex-row justify-between w-full mb-6">
              {otp.map((digit, idx) => (
                <RNTextInput
                  key={idx}
                  ref={(ref) => (otpInputs.current[idx] = ref)}
                  className="w-11 h-14 border border-[#D0D5DD] rounded-xl text-center text-xl bg-white"
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                />
              ))}
            </View>

            {!!apiError && (
              <Text className="text-xs mb-4 text-center" style={styles.errorText}>{apiError}</Text>
            )}

            <View className="flex-row items-center mb-8">
              <Text className="text-xs" style={styles.resendText}>Didn’t receive the code? </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={isResendDisabled}>
                <Text className="text-xs" style={styles.resendLink}>
                  Resend OTP {isResendDisabled && formatTimer(resendTimer)}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center" onPress={handleVerifyOtp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-base" style={styles.primaryButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: NEW PASSWORD */}
        {step === 4 && (
          <View className="items-center w-full">
            <PasswordInput
              label="New Password *"
              value={newPassword}
              onChangeText={setNewPassword}
              helperText="Use at least 8 alphanumeric characters and symbols."
            />

            <PasswordInput
              label="Confirm new Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {!!passwordError && (
              <Text className="text-xs mb-3 self-start" style={styles.errorText}>{passwordError}</Text>
            )}

            <TouchableOpacity className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center mt-6" onPress={handleUpdatePassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-base" style={styles.primaryButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: PASSWORD UPDATED TAB VIEW */}
        {step === 5 && (
          <View className="items-center w-full">
            <View className="w-28 h-28 rounded-full bg-[#D1FADF] items-center justify-center my-6">
              <SuccessIcon width={85} height={85} />
            </View>

            <Text className="text-xl text-center mb-2" style={styles.successTitle}>
              Your password has been successfully updated
            </Text>

            <Text className="text-sm text-center leading-6 mb-6" style={styles.successSubtext}>
              Your password has been updated. You can continue using your account.
            </Text>

            {/* Organized Security Note Box */}
            <View className="w-full bg-[#F0F9FF] border border-[#B9E6FE] rounded-2xl p-5 my-2">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-checkmark-outline" size={22} color="#0284C7" />
                <Text className="text-sm ml-2" style={styles.noteTitle}>
                  Important Security Reminder
                </Text>
              </View>

              <Text className="text-xs leading-5 mb-3" style={styles.noteText}>
                We strongly recommend keeping a physical record of your login details in a secure notebook or notepad:
              </Text>

              <View className="bg-white border border-[#E0F2FE] rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="card-outline" size={16} color="#0284C7" />
                  <Text className="text-xs ml-2" style={styles.bulletTitle}>
                    Employee Number
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="key-outline" size={16} color="#0284C7" />
                  <Text className="text-xs ml-2" style={styles.bulletTitle}>
                    New Password
                  </Text>
                </View>
              </View>

              <Text className="text-[11px] leading-4" style={styles.noteSubtext}>
                Having an offline copy ensures you always have a reliable backup if you forget your credentials.
              </Text>
            </View>

            <TouchableOpacity className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center mt-6" onPress={() => router.replace('/tabs/Home')}>
              <Text className="text-base" style={styles.primaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* STEP 3: OTP VERIFIED MODAL */}
      <OtpVerifiedModal
        visible={showVerifiedModal}
        onContinue={handleVerifiedModalContinue}
      />
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  descriptionText: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  emailText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#444444',
    includeFontPadding: false,
  },
  emailSubtext: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  otpDescriptionLabel: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  otpEmailText: {
    fontFamily: 'Poppins-Bold',
    color: '#444444',
    includeFontPadding: false,
  },
  otpBox: {
    fontFamily: 'Poppins-Bold',
    color: '#444444',
  },
  resendText: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  resendLink: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  resendDisabled: {
    color: '#94A3B8',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#E53935',
    includeFontPadding: false,
  },
  successTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#444444',
    includeFontPadding: false,
  },
  successSubtext: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  noteTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#0369A1',
    includeFontPadding: false,
  },
  noteText: {
    fontFamily: 'Poppins-Regular',
    color: '#0C4A6E',
    includeFontPadding: false,
  },
  bulletTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#0369A1',
    includeFontPadding: false,
  },
  noteSubtext: {
    fontFamily: 'Poppins-Regular',
    color: '#0284C7',
    includeFontPadding: false,
  },
});
