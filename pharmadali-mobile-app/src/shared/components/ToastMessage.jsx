import React from 'react';
import { View, Text } from 'react-native';

const toastTheme = {
  success: {
    container: 'bg-emerald-400',
    title: 'Success',
  },
  error: {
    container: 'bg-rose-400',
    title: 'Error',
  },
  info: {
    container: 'bg-slate-400',
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
      <View className={`self-center max-w-[300px] rounded-full px-4 py-2 shadow-lg ${theme.container}`}>
        <Text className="text-xs text-white" style={{ fontFamily: 'Poppins-SemiBold' }} numberOfLines={1} ellipsizeMode="tail">
          {`${theme.title}: ${message}`}
        </Text>
      </View>
    </View>
  );
}
