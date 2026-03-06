import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import CircularLogo from '@assets/circular_logo.svg';
import { colors } from '@shared/colorPallete';
import AnimatedSplashLayout from '@shared/components/AnimatedSplashLayout';

export default function LoginScreen() {

  return (
    <AnimatedSplashLayout>
      <View className="items-center mt-10">
        <CircularLogo width={80} height={80} />
        <Text className="text-2xl mt-2" style={styles.greetingsText}>
          Hello!
        </Text>
        <Text style={styles.regularText} className="text-center mt-2 mb-5">
          For your security, we need to verify your identity
        </Text>
        <TouchableOpacity className="rounded-lg bg-[#48AAD9] mt-10 px-6 py-3 mb-2" style={styles.semiBoldText}>
          <Link href="/pharmacist/auth/EnterPin">
            <Text className="text-white font-bold">Ilagay ang PIN Code</Text>
          </Link>
        </TouchableOpacity>
        <Text>-Or-</Text>
        <TouchableOpacity className="rounded-lg border border-[#48AAD9] mt-2 px-3 py-3" style={styles.semiBoldText}>
          <Link href="/pharmacist/auth/Fingerprint">
            <Text className="text-[#48AAD9] font-bold">Gumamit ng Fingerprint</Text>
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
  },
  regularText: {
    fontFamily: 'Poppins-Regular',
    color: colors.textColor,
  },
  semiBoldText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  }
});