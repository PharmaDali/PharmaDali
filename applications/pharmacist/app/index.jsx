import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import CircularLogo from '@assets/circular_logo.svg';
import { colors } from '@src/shared/theme/colorPalette';
import AnimatedSplashLayout from '@src/shared/components/AnimatedSplashLayout';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <AnimatedSplashLayout>
      <View className="items-center mt-10">
        <CircularLogo width={80} height={80} />
        <Text className="text-2xl mt-2 text-center w-full px-2" style={styles.greetingsText}>
          Hello!
        </Text>
        <Text style={styles.regularText} className="text-center mt-2 mb-5 w-full px-2">
          For your security, we need to verify your identity
        </Text>
        <TouchableOpacity className="rounded-lg bg-[#48AAD9] mt-10 px-6 py-3 mb-2">
          <Link href="/auth/PharmacistLogin">
            <Text className="font-bold text-white" style={[styles.semiBoldText, { color: '#FFFFFF' }]}>Mag-login</Text>
          </Link>
        </TouchableOpacity>
      </View>
    </AnimatedSplashLayout>
  );
}

const styles = StyleSheet.create({
  greetingsText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
  },
  regularText: {
    fontFamily: 'Poppins-Regular',
    color: colors.textColor,
    includeFontPadding: false,
  },
  semiBoldText: {
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  }
});

