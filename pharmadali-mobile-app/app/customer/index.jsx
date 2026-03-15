import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { TextInput, Button, Text } from 'react-native-paper';
import theme from '@shared/inputTheme';
import { useConfirmPasswordToggle } from '@shared/confirmPasswordToggle';
import AnimatedSplashLayout from '@shared/components/AnimatedSplashLayout';
import { loginCustomer } from '@shared/services/authService';
import { validateCustomerLogin } from '@shared/validation/authValidation';

export default function LoginScreen() {
  const router = useRouter();
  const passwordToggleIcon = useConfirmPasswordToggle();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleLogin = async () => {
    const validationMessage = validateCustomerLogin({ email, password });
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await loginCustomer({ email, password });

      // TODO: Persist token securely (e.g. expo-secure-store) before navigating.
      router.replace('/customer/tabs/Home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSplashLayout>
      <TextInput
        label="Email"
        mode="outlined"
        theme={theme}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={!passwordToggleIcon.showPassword}
        theme={theme}
        style={styles.input}
        right={passwordToggleIcon.icon}
        value={password}
        onChangeText={setPassword}
      />  
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Text variant="bodySmall">Use at least 15 alphanumeric characters and symbols.</Text>
      <Link href="/customer/auth/EnterMobileNumberFPW" style={styles.forgotPassword}>Forgot Password?</Link>
      <View style={{ alignItems: 'center' }}>
        <Button mode="contained" style={styles.loginButton} onPress={handleLogin} loading={isSubmitting} disabled={isSubmitting}>
          Mag-Login
        </Button>
        <Text style={styles.noAccountText}>Wala pang account?</Text>
        <Button mode="outlined" style={styles.registerButton} labelStyle={styles.registerButtonLabel} onPress={() => router.push('/customer/auth/Register')}>
          Mag-Register
        </Button>
      </View>
    </AnimatedSplashLayout>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: '#E53935',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    activeOutlineColor: '#48AAD9',
  },
  loginButton: {
    borderRadius: 10,
    marginTop: 8,
    width: '50%',
    backgroundColor: '#48AAD9',
  },
  forgotPassword: {
    marginTop: 8,
    marginBottom: 16,
    color: '#48AAD9',
    textDecorationLine: 'underline',
  },
  noAccountText: {
    marginTop: 20,
    color: '#888',
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 10,
    width: '50%',
    borderColor: '#48AAD9',
  },
  registerButtonLabel: {
    color: '#48AAD9',
  }
});