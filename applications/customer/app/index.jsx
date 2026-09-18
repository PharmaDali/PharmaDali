import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { TextInput, Button } from 'react-native-paper';
import theme from '@src/shared/theme/inputTheme';
import { useConfirmPasswordToggle } from '@src/shared/hooks/confirmPasswordToggle';
import AnimatedSplashLayout from '@src/shared/components/AnimatedSplashLayout';
import { loginCustomer } from '@src/shared/services/authService';
import { validateCustomerLogin } from '@src/shared/validation/authValidation';

import { syncFcmTokenWithBackend } from '@shared/utils/notificationUtils';

export default function LoginScreen() {
  const router = useRouter();
  const passwordToggleIcon = useConfirmPasswordToggle();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkExistingSession() {
      try {
        const raw = await SecureStore.getItemAsync('customer_token');
        if (raw) {
          let tokenStr = null;
          try {
            const parsed = JSON.parse(raw);
            tokenStr = typeof parsed === 'string' ? parsed : (parsed?.token || null);
          } catch {
            tokenStr = raw;
          }

          if (tokenStr) {
            router.replace('/tabs/Home');
            return;
          }
        }
      } catch (err) {
        console.warn('[Customer Auth] Session check notice:', err);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async () => {
    const validationMessage = validateCustomerLogin({ email, password });
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = await loginCustomer({ email, password });

      await SecureStore.setItemAsync('customer_token', JSON.stringify(token));
      syncFcmTokenWithBackend().catch(() => {});

      router.replace('/tabs/Home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    );
  }

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
        autoCapitalize="none"
      />
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <Link href="/auth/EnterMobileNumberFPW" style={styles.forgotPassword}>Forgot Password?</Link>
      <View style={{ alignItems: 'center' }}>
        <Button mode="contained" style={styles.loginButton} onPress={handleLogin} loading={isSubmitting} disabled={isSubmitting}>
          Mag-Login
        </Button>
        <Text style={styles.noAccountText}>Wala pang account?</Text>
        <Button mode="outlined" style={styles.registerButton} labelStyle={styles.registerButtonLabel} onPress={() => router.push('/auth/Register')}>
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

