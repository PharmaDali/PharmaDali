import { Text, Pressable } from 'react-native'
import { colors } from '../colorPallete'
import React from 'react'

const CustomButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  variant = 'filled',
  className = '',
  ...props 
}) => {
  
  return (
    <Pressable
      className={`rounded-lg items-center justify-center px-6 py-3 ${disabled ? 'opacity-50' : ''} ${className}`}
      style={[
        variant === 'filled' 
          ? { backgroundColor: colors.buttonColor } 
          : { borderWidth: 2, borderColor: colors.buttonColor, backgroundColor: 'transparent' }
      ]}
      onPress={disabled ? null : onPress}
      disabled={disabled}
      {...props}
    >
      {({ pressed }) => (
        <Text 
          className={`font-semibold text-base ${pressed ? 'opacity-80' : ''}`}
          style={{ color: variant === 'filled' ? '#FFFFFF' : colors.buttonColor }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}

export default CustomButton