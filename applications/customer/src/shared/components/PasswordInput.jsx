import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import theme from '@src/shared/theme/inputTheme';

const PasswordInput = ({
  label = 'Password',
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  style,
  autoCapitalize = 'none',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const dynamicFontFamily = showPassword ? 'Poppins-Regular' : (Platform.OS === 'ios' ? 'Poppins-Regular' : undefined);

  return (
    <View className="w-full mb-4">
      <TextInput
        label={label}
        mode="outlined"
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        theme={{
          ...theme,
          fonts: {
            ...theme.fonts,
            bodyLarge: { fontFamily: dynamicFontFamily || 'System', fontWeight: '400' },
          },
        }}
        activeOutlineColor="#48AAD9"
        textColor="#444444"
        contentStyle={[
          styles.contentStyle,
          { fontFamily: dynamicFontFamily },
        ]}
        style={[styles.inputStyle, { fontFamily: dynamicFontFamily }, style]}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye' : 'eye-off'}
            onPress={() => setShowPassword(!showPassword)}
            color="#48AAD9"
          />
        }
      />
      {!!helperText && !error && (
        <Text className="mt-1 ml-1 text-[11px]" style={styles.helperText}>
          {helperText}
        </Text>
      )}
      {!!error && typeof error === 'string' && (
        <Text className="mt-1 ml-1 text-xs" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  contentStyle: {
    color: '#444444',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 0,
  },
  inputStyle: {
    fontWeight: '400',
    fontSize: 14,
  },
  helperText: {
    fontFamily: 'Poppins-Regular',
    color: '#777777',
    includeFontPadding: false,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#E53935',
    includeFontPadding: false,
  },
});
