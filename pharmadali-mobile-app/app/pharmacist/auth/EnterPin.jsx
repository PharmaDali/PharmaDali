import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DescriptiveLogo from '@shared/components/DescriptiveLogo';

const PIN_LENGTH = 6;
const DUMMY_PIN = '123456';
const KEYPAD_ROWS = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

const EnterPin = () => {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePress = useCallback((digit) => {
    setError('');
    setPin((prev) => (prev.length < PIN_LENGTH ? prev + digit : prev));
  }, []);

  const handleDelete = useCallback(() => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;

    if (pin === DUMMY_PIN) {
      router.replace('/pharmacist/tabs/Home');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  }, [pin, router]);

  const renderDots = () => (
    <View className="flex-row items-center justify-center gap-3 mt-4">
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < pin.length ? 'bg-[#48AAD9]' : 'bg-[#96D2EE]'
          }`}
        />
      ))}
    </View>
  );

  const renderKey = (value) => (
    <TouchableOpacity
      key={value}
      onPress={() => handlePress(String(value))}
      className="w-20 h-20 rounded-full items-center justify-center border border-[#96D2EE] m-2"
    >
      <Text style={styles.keyText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#48AAD9" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Text style={styles.tagalogText}>Tagalog</Text>
          <Ionicons name="caret-down" size={12} color="#48AAD9" />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-2">
        <DescriptiveLogo />
      </View>

      <View className="items-center mt-8">
        <Text style={styles.title}>PIN Code Verification</Text>
        <Text style={styles.subtitle}>Enter your current PIN</Text>
        {renderDots()}
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View className="flex-1 justify-end items-center pb-6">
        <View className="items-center">
          {KEYPAD_ROWS.map((row, idx) => (
            <View key={idx} className="flex-row">
              {row.map((num) => renderKey(num))}
            </View>
          ))}

          <View className="flex-row">
            <View className="w-20 h-20 m-2" />
            {renderKey(0)}
            <TouchableOpacity
              onPress={handleDelete}
              className="w-20 h-20 rounded-full items-center justify-center m-2"
            >
              <Ionicons name="backspace-outline" size={28} color="#96D2EE" />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable className="mt-4">
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default EnterPin;

const styles = StyleSheet.create({
  keyText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#48AAD9',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#444444',
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#E53935',
    marginTop: 12,
  },
  tagalogText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#48AAD9',
    marginRight: 2,
  },
  forgotText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#48AAD9',
    textDecorationLine: 'underline',
  },
});