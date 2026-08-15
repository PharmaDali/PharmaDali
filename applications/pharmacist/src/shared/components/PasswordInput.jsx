import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
        theme={theme}
        activeOutlineColor="#48AAD9"
        textColor="#444444"
        contentStyle={{ color: '#444444', fontFamily: 'Poppins-Regular' }}
        style={style}
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
