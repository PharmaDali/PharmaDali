import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { TextInput, Button, Text } from 'react-native-paper';
import theme from '@shared/inputTheme';
import DescriptiveLogo from '@assets/descriptive_logo.svg';
import { useConfirmPasswordToggle } from '@shared/confirmPasswordToggle';

const AnimatedLogo = Animated.createAnimatedComponent(DescriptiveLogo);

export default function LoginScreen() {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -220,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const passwordToggleIcon = useConfirmPasswordToggle();

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { translateY: logoPosition }
            ],
          },
        ]}
      >
        <AnimatedLogo
          width={250}
          height={250}
        />
      </Animated.View>

      {/* Login Form */}
      <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    marginTop: 100,
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