import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { TextInput, Button, Text } from 'react-native-paper';
import theme from '@shared/inputTheme';
import { useConfirmPasswordToggle } from '@shared/confirmPasswordToggle';
import AnimatedSplashLayout from '@shared/components/AnimatedSplashLayout';

export default function LoginScreen() {
  const router = useRouter();
  const passwordToggleIcon = useConfirmPasswordToggle();

  return (
    <AnimatedSplashLayout>
      <TextInput
        label="Mobile Number"
        mode="outlined"
        keyboardType='phone-pad'
        theme={theme}
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={!passwordToggleIcon.showPassword}
        theme={theme}
        style={styles.input}
        right={passwordToggleIcon.icon}
      />  
      <Text variant="bodySmall">Use at least 15 alphanumeric characters and symbols.</Text>
      <Link href="/customer/auth/EnterMobileNumberFPW" style={styles.forgotPassword}>Forgot Password?</Link>
      <View style={{ alignItems: 'center' }}>
        <Button mode="contained" style={styles.loginButton} onPress={() => router.push('/customer/tabs/Home')}>
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