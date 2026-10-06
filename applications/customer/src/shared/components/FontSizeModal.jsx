import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFontSize, FONT_SIZE_OPTIONS } from '@shared/context/FontSizeContext';

export default function FontSizeModal({ visible, onClose }) {
  const { fontSize: activeSize, setFontSize } = useFontSize();
  const [selectedSize, setSelectedSize] = useState(activeSize);

  // Sync selected size with active size whenever modal opens
  useEffect(() => {
    if (visible) {
      setSelectedSize(activeSize);
    }
  }, [visible, activeSize]);

  const handleApply = async () => {
    await setFontSize(selectedSize);
    onClose?.();
  };

  if (!visible) return null;

  const currentOption = FONT_SIZE_OPTIONS[selectedSize] || FONT_SIZE_OPTIONS.medium;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-4 py-8">
        <View className="w-full max-w-[370px] bg-white rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#EBF7FC] items-center justify-center mr-3">
                <Ionicons name="text-outline" size={20} color="#48AAD9" />
              </View>
              <View>
                <Text
                  className="text-lg text-slate-800"
                  style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
                >
                  Font Size
                </Text>
                <Text
                  className="text-xs text-slate-500"
                  style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
                >
                  Choose your reading preference
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView className="max-h-[380px] my-4" showsVerticalScrollIndicator={false}>
            {Object.values(FONT_SIZE_OPTIONS).map((opt) => {
              const isSelected = selectedSize === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSelectedSize(opt.key)}
                  activeOpacity={0.8}
                  className={`w-full p-3.5 mb-2.5 rounded-2xl border flex-row items-center ${
                    isSelected
                      ? 'border-[#48AAD9] bg-[#F0F9FF]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Icon Avatar */}
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                      isSelected ? 'bg-[#48AAD9]' : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        isSelected ? 'text-white' : 'text-slate-600'
                      }`}
                      style={{
                        fontSize: opt.previewSize,
                        fontFamily: 'Poppins-Bold',
                        includeFontPadding: false,
                      }}
                    >
                      Aa
                    </Text>
                  </View>

                  {/* Text details */}
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                      <Text
                        className={`text-sm ${
                          isSelected ? 'text-[#0284C7]' : 'text-slate-800'
                        }`}
                        style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
                      >
                        {opt.label}
                      </Text>
                      {opt.isDefault && (
                        <View className="ml-2 bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#BAE6FD]">
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
                      className="text-xs text-slate-500 mt-0.5"
                      style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
                    >
                      {opt.description}
                    </Text>
                  </View>

                  {/* Radio indicator */}
                  <View
                    className={`w-5 h-5 rounded-full border items-center justify-center ${
                      isSelected
                        ? 'border-[#48AAD9] bg-[#48AAD9]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Live Preview Card */}
            <View className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-[11px] text-slate-500 tracking-wider uppercase"
                  style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
                >
                  Live Preview
                </Text>
                <Text
                  className="text-[11px] text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
                >
                  {currentOption.label} ({Math.round(currentOption.scale * 100)}%)
                </Text>
              </View>

              <View className="bg-white p-3 rounded-xl border border-slate-100">
                <Text
                  className="text-slate-800"
                  style={{
                    fontSize: Math.round(15 * currentOption.scale),
                    fontFamily: 'Poppins-Bold',
                    includeFontPadding: false,
                  }}
                >
                  Biogesic 500mg Tablet
                </Text>
                <Text
                  className="text-slate-500 mt-1"
                  style={{
                    fontSize: Math.round(12 * currentOption.scale),
                    fontFamily: 'Poppins-Regular',
                    includeFontPadding: false,
                  }}
                >
                  Ang gamot para sa lagnat at pananakit ng katawan.
                </Text>
                <Text
                  className="text-[#48AAD9] mt-2 font-bold"
                  style={{
                    fontSize: Math.round(14 * currentOption.scale),
                    fontFamily: 'Poppins-SemiBold',
                    includeFontPadding: false,
                  }}
                >
                  ₱8.50 / piraso
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View className="flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white items-center justify-center active:bg-slate-50"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm text-slate-600"
                style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 py-3 px-4 rounded-xl bg-[#48AAD9] items-center justify-center active:bg-[#3898c6]"
              activeOpacity={0.85}
            >
              <Text
                className="text-sm text-white"
                style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
