import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-paper'
import { colors } from '@shared/colorPallete'
import theme  from '@shared/inputTheme'
import CustomButton from '@shared/components/Button';
import DescriptiveLogo from '@shared/components/DescriptiveLogo';
import { useConfirmPasswordToggle } from '@shared/confirmPasswordToggle';

const CreateNewPasswordFPW = () => {

  const passwordToggleIcon = useConfirmPasswordToggle();
  const confirmPasswordToggleIcon = useConfirmPasswordToggle();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView className="w-full"
        contentContainerStyle={{ padding: 16, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}>
          <DescriptiveLogo />
          <View className="border border-gray-300 p-3 rounded-lg w-full">
            <Text className="text-xl font-semibold p-3 text-center" style={{ color: colors.textColor }}>Reset Password</Text>
            <TextInput
              label="New Password"
              mode="outlined"
              secureTextEntry={!passwordToggleIcon.showPassword}
              style={{ width: "100%", marginBottom: 16, marginTop: 8 }}
              theme={theme}
              right={passwordToggleIcon.icon}
            />
            <TextInput
              label="Confirm New Password"
              mode="outlined"
              secureTextEntry={!confirmPasswordToggleIcon.showPassword}
              style={{ width: "100%", marginBottom: 16, marginTop: 8 }}
              theme={theme}
              right={confirmPasswordToggleIcon.icon}
            />
          </View>
          <CustomButton className="w-50 mt-4" title="I-reset ang password" onPress={() => {
            // Handle password reset submission
          }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default CreateNewPasswordFPW

const styles = StyleSheet.create({})