import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import CircularLogo from '@assets/circular_logo.svg';
import { colors } from '@src/shared/theme/colorPalette';
import AnimatedSplashLayout from '@src/shared/components/AnimatedSplashLayout';

export default function LoginScreen() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkExistingSession() {
      try {
        const raw = await SecureStore.getItemAsync('pharmacist_token');
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
        console.warn('[Pharmacist Auth] Session check notice:', err);
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

  if (isCheckingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    );
  }

  return (
    <AnimatedSplashLayout>
      <View className="items-center mt-10">
        <CircularLogo width={80} height={80} />
        <Text className="text-2xl mt-2 text-center w-full px-2" style={styles.greetingsText}>
          Hello!
        </Text>
        <Text style={styles.regularText} className="text-center mt-2 mb-5 w-full px-4 text-sm">
          For your security, we need to verify your identity
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-[#48AAD9] mt-10 px-8 py-3 mb-2 items-center justify-center"
          activeOpacity={0.8}
          onPress={() => router.push('/auth/PharmacistLogin')}
        >
          <Text className="font-bold text-white text-base" style={[styles.semiBoldText, { color: '#FFFFFF' }]}>
            Mag-login
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedSplashLayout>
  );
}

const styles = StyleSheet.create({
  greetingsText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    lineHeight: 32,
    includeFontPadding: false,
  },
  regularText: {
    fontFamily: 'Poppins-Regular',
    color: colors.textColor,
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 4,
    includeFontPadding: false,
  },
  semiBoldText: {
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  }
});

