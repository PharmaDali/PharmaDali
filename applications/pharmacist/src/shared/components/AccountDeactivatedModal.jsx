import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export const DEACTIVATED_EVENT = 'PHARMACIST_ACCOUNT_DEACTIVATED_EVENT';

export function triggerAccountDeactivatedModal(message) {
  DeviceEventEmitter.emit(DEACTIVATED_EVENT, { message });
}

export default function AccountDeactivatedModal() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(
    'Your pharmacist account has been deactivated. Please contact your pharmacy administrator.'
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(DEACTIVATED_EVENT, (data) => {
      if (data?.message) {
        setMessage(data.message);
      }
      setVisible(true);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="w-full max-w-[340px] bg-white rounded-3xl px-6 pt-7 pb-6 items-center shadow-2xl">
          {/* Circular Red Warning Icon */}
          <View className="w-[72px] h-[72px] rounded-full bg-red-100 items-center justify-center mb-3.5">
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2.2" />
              <Path
                d="M12 8v5"
                stroke="#EF4444"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <Circle cx="12" cy="16.5" r="1.2" fill="#EF4444" />
            </Svg>
          </View>

          {/* Badge */}
          <View className="bg-red-50 border border-red-200 px-3 py-1 rounded-full mb-2.5">
            <Text
              className="text-[11px] text-red-600 tracking-wider"
              style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
            >
              ACCESS REVOKED
            </Text>
          </View>

          {/* Title */}
          <Text
            className="text-[19px] text-slate-800 text-center mb-2"
            style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
          >
            Account Deactivated
          </Text>

          {/* Description */}
          <Text
            className="text-[13px] text-slate-500 text-center leading-5 mb-6"
            style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
          >
            {message ||
              'Your pharmacist account has been deactivated by the pharmacy administrator. Please contact management.'}
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            className="w-full bg-red-500 rounded-2xl py-3.5 items-center justify-center active:bg-red-600"
            onPress={() => setVisible(false)}
            activeOpacity={0.85}
          >
            <Text
              className="text-sm text-white"
              style={{ fontFamily: 'Poppins-Bold', includeFontPadding: false }}
            >
              Understood
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
