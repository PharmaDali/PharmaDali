import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

const toastTheme = {
  success: {
    container: 'bg-emerald-600',
    icon: 'check-circle',
    title: 'Success',
  },
  error: {
    container: 'bg-rose-600',
    icon: 'alert-circle',
    title: 'Error',
  },
  info: {
    container: 'bg-slate-700',
    icon: 'information',
    title: 'Notice',
  },
};

export default function ToastMessage({
  visible,
  message,
  type = 'info',
  topOffset = 12,
}) {
  if (!visible || !message) {
    return null;
  }

  const theme = toastTheme[type] || toastTheme.info;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 z-50 items-center px-4"
      style={{ top: topOffset }}
    >
      <Animated.View
        entering={FadeInDown.duration(220)}
        exiting={FadeOutUp.duration(160)}
        className={`self-center w-full max-w-[360px] rounded-2xl px-4 py-3 shadow-xl ${theme.container}`}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View className="flex-row items-start">
          <MaterialCommunityIcons name={theme.icon} size={18} color="#FFFFFF" />
          <View className="ml-2 flex-1">
            <Text className="text-[11px] text-white/90" style={{ fontFamily: 'Poppins-Bold' }}>
              {theme.title}
            </Text>
            <Text
              className="text-xs text-white mt-0.5"
              style={{ fontFamily: 'Poppins-Medium', lineHeight: 16 }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {message}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
