import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView} from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-paper'
import CustomButton from '../../shared/components/Button';
import { colors } from '../../shared/colorPallete'
import DescriptiveLogo from '../../shared/components/DescriptiveLogo';
import { useRouter } from 'expo-router';
import theme from '../../shared/inputTheme';

const EnterMobileNumber = () => {
  const router = useRouter();
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
          <Text className="text-center mb-4" style={{ color: colors.textColor }}>Enter your registered mobile number</Text>
          <TextInput
            label="Mobile Number"
            mode="outlined"
            keyboardType='phone-pad'
            theme={theme}
            style={{ width: "100%", marginBottom: 16 }}
          />  
          <CustomButton className="w-40 mt-2" title="I-submit" onPress={() => {
            router.push('auth/EnterOTPFPW');
          }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default EnterMobileNumber

const styles = StyleSheet.create({})