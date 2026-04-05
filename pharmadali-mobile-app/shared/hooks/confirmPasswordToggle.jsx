import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';

export const useConfirmPasswordToggle = () => {
  const [showPassword, setShowPassword] = useState(false);
  const icon = (
    <TextInput.Icon
      icon={!showPassword ? 'eye-off' : 'eye'}
      onPress={() => setShowPassword(!showPassword)}
      color='#48AAD9'
    />
  );
  return { showPassword, icon };
};