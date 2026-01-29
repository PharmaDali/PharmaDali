import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { TextInput, Button, Provider, Text } from 'react-native-paper';

export default function LoginScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Fade in logo at center
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // 2. Wait 2 seconds
      Animated.delay(2000),
      // 3. Move logo up and fade in form simultaneously
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -220, 
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 800,
          delay: 400, // Start fading in form slightly after logo starts moving
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const theme = {
    colors: {
      primary: '#48AAD9',
    },
    roundness: 10,
  }

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoPosition }],
          },
        ]}
      >
        <Image
          source={require('../assets/descriptive_logo.png')} // Your descriptive logo
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Animated Login Form */}
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
          secureTextEntry
          theme={theme}
          style={styles.input}
        />
        <Text variant="bodySmall">Use at least 15 alphanumeric characters and symbols.</Text>
        <Link href="#" style={styles.forgotPassword}>Forgot Password?</Link>
        <View style={{ alignItems: 'center' }}>
          <Button mode="contained" style={styles.loginButton}>
            Mag-Login
          </Button>
          <Text style={styles.noAccountText}>Wala pang account?</Text>
          <Button mode="outlined" style={styles.registerButton} labelStyle={styles.registerButtonLabel}>
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
  logo: {
    width: 250,
    height: 250,
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