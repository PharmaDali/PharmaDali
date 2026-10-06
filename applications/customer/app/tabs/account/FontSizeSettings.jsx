import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFontSize, FONT_SIZE_OPTIONS } from '@shared/context/FontSizeContext';

export default function FontSizeSettings() {
  const router = useRouter();
  const { fontSize: activeSize, setFontSize } = useFontSize();
  const [selectedSize, setSelectedSize] = useState(activeSize);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async () => {
    await setFontSize(selectedSize);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      router.back();
    }, 600);
  };

  const currentOption = FONT_SIZE_OPTIONS[selectedSize] || FONT_SIZE_OPTIONS.medium;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity
          className="p-1"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#48AAD9" />
        </TouchableOpacity>
        <Text
          className="text-lg text-slate-800"
          style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
        >
          Font Size
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-5" showsVerticalScrollIndicator={false}>
        <Text
          className="text-xs text-slate-500 mb-4 px-1"
          style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
        >
          Select a font size that fits your reading comfort. Changes apply across the entire PharmaDali customer app.
        </Text>

        {/* Options list */}
        {Object.values(FONT_SIZE_OPTIONS).map((opt) => {
          const isSelected = selectedSize === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSelectedSize(opt.key)}
              activeOpacity={0.8}
              className={`w-full p-4 mb-3 rounded-2xl border flex-row items-center ${
                isSelected
                  ? 'border-[#48AAD9] bg-[#F0F9FF]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <View
                className={`w-11 h-11 rounded-2xl items-center justify-center mr-3.5 ${
                  isSelected ? 'bg-[#48AAD9]' : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}
                  style={{
                    fontSize: opt.previewSize,
                    fontFamily: 'Poppins-Bold',
                    includeFontPadding: false,
                  }}
                >
                  Aa
                </Text>
              </View>

              <View className="flex-1 mr-2">
                <View className="flex-row items-center">
                  <Text
                    className={`text-base ${isSelected ? 'text-[#0284C7]' : 'text-slate-800'}`}
                    style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
                  >
                    {opt.label}
                  </Text>
                  {opt.isDefault && (
                    <View className="ml-2 bg-[#E0F2FE] px-2.5 py-0.5 rounded-full border border-[#BAE6FD]">
                      <Text
                        className="text-[10px] text-[#0284C7]"
                        style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
                      >
                        DEFAULT
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className="text-xs text-slate-500 mt-1"
                  style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
                >
                  {opt.description}
                </Text>
              </View>

              <View
                className={`w-6 h-6 rounded-full border items-center justify-center ${
                  isSelected
                    ? 'border-[#48AAD9] bg-[#48AAD9]'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && (
                  <View className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Live Preview Card */}
        <View className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-xs text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
            >
              Live Preview
            </Text>
            <View className="bg-[#EBF7FC] px-2.5 py-0.5 rounded-full">
              <Text
                className="text-xs text-[#0284C7]"
                style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
              >
                {currentOption.label} ({Math.round(currentOption.scale * 100)}%)
              </Text>
            </View>
          </View>

          <View className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Text
              className="text-slate-800"
              style={{
                fontSize: Math.round(16 * currentOption.scale),
                fontFamily: 'Poppins-Bold',
                includeFontPadding: false,
              }}
            >
              Paracetamol 500mg
            </Text>
            <Text
              className="text-slate-600 mt-1.5 leading-5"
              style={{
                fontSize: Math.round(13 * currentOption.scale),
                fontFamily: 'Poppins-Regular',
                includeFontPadding: false,
              }}
            >
              PharmaDali delivers verified prescription medicines and healthcare essentials straight to you.
            </Text>
            <Text
              className="text-[#48AAD9] mt-3"
              style={{
                fontSize: Math.round(15 * currentOption.scale),
                fontFamily: 'Poppins-Bold',
                includeFontPadding: false,
              }}
            >
              ₱8.50 / tablet
            </Text>
          </View>
        </View>

        {savedNotice && (
          <View className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl items-center">
            <Text
              className="text-xs text-emerald-700"
              style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
            >
              Font size updated successfully!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Save Button */}
      <View className="p-4 bg-white border-t border-slate-200">
        <TouchableOpacity
          onPress={handleSave}
          className="w-full bg-[#48AAD9] py-3.5 rounded-2xl items-center justify-center active:bg-[#3898c6]"
          activeOpacity={0.85}
        >
          <Text
            className="text-base text-white"
            style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
          >
            Apply Font Size
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
