import { StyleSheet, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
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

const Register = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const passwordToggleIcon = useConfirmPasswordToggle();
  const confirmPasswordToggleIcon = useConfirmPasswordToggle();
  const { toast, showSuccess } = useToast();

  const formatDate = (date) => {
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
      await registerCustomer({
        credentials: {
          ...credentials,
          dateOfBirth: formatDateForApi(dateOfBirth),
        },
      });

      showSuccess('Registration successful! Please log in.');

      setTimeout(() => {
        router.replace('/');
      }, 3000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
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
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 16,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <DescriptiveLogo />
          
          <View className="flex-1 border border-gray-300 p-3 rounded-lg">
            <View style={styles.registerLabel}>
              <Text variant="headlineSmall">Register</Text>
            </View>
            <View style={styles.nameContainer}>
              <TextInput
                label="Last Name"
                mode="outlined"
                theme={theme}
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
              />
              <TextInput
                label="First Name"
                mode="outlined"
                theme={theme}
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
            </View>
            <View style={styles.primaryInfoContainer}>
              <TextInput
                label="Email"
                mode="outlined"
                keyboardType='email-address'
                theme={theme}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                style={{ marginBottom: 16 }}
              />
              <Pressable onPress={() => setShowDatePicker(true)}>
                <TextInput
                  label="Date of Birth"
                  mode="outlined"
                  theme={theme}
                  value={formatDate(dateOfBirth)}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
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
                onChangeText={setMobileNumber}
              />
              <TextInput
                label="Address"
                mode="outlined"
                theme={theme}
                style={{ marginTop: 16 }}
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry={!passwordToggleIcon.showPassword}
                theme={theme}
                value={password}
                onChangeText={setPassword}
                style={{ marginTop: 16 }}
                right={passwordToggleIcon.icon}
                autoCapitalize='none'
              />
              <TextInput
                label="Confirm Password"
                mode="outlined"
                secureTextEntry={!confirmPasswordToggleIcon.showPassword}
                theme={theme}
                style={{ marginTop: 16 }}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                right={confirmPasswordToggleIcon.icon}
                autoCapitalize='none'
              />
              {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>
          </View>
          <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#48AAD9" textColor="#FFFFFF" onPress={handleRegister} loading={isSubmitting} disabled={isSubmitting}>
            Mag-Register
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Register

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  registerLabel: {
    marginBottom: 8,
    alignItems: 'center',
  },
  nameContainer: {
    gap: 8,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  primaryInfoContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#E53935',
    marginTop: 12,
  },
})

