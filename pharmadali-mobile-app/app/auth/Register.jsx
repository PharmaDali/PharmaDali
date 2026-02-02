import { StyleSheet, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import DescriptiveLogo from '../../shared/components/DescriptiveLogo';
import theme from '../../shared/inputTheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useConfirmPasswordToggle } from '../../shared/confirmPasswordToggle';

const Register = () => {
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const passwordToggleIcon = useConfirmPasswordToggle();

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ padding: 16, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <DescriptiveLogo />
        <View className="flex-1 border border-gray-300 p-3 rounded-lg">
          <View style={styles.registerLabel}>
            <Text variant="headlineSmall">Register</Text>
          </View>
          <View style={styles.nameContainer}>
            <TextInput
              label="Last Name"
              mode="outlined"
              theme={theme}
              style={styles.input}
            />
            <TextInput
              label="First Name"
              mode="outlined"
              theme={theme}
              style={styles.input}
            />
          </View>
          <View style={styles.primaryInfoContainer}>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Date of Birth"
                mode="outlined"
                theme={theme}
                value={formatDate(dateOfBirth)}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
              />
            )}
            <TextInput
              label="Mobile Number"
              mode="outlined"
              keyboardType='phone-pad'
              theme={theme}
              style={{ marginTop: 16 }}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!passwordToggleIcon.showPassword}
              theme={theme}
              style={{ marginTop: 16 }}
              right={passwordToggleIcon.icon}
            />
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry={!passwordToggleIcon.showPassword}
              theme={theme}
              style={{ marginTop: 16 }}
              right={passwordToggleIcon.icon}
            />
          </View>
        </View>
        <Button mode="contained" style={{ marginTop: 16, borderRadius: 10 }} buttonColor="#48AAD9" textColor="#FFFFFF">
          Mag-Register
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  registerLabel: {
    marginBottom: 8,
    alignItems: 'center',
  },
  nameContainer: {
    gap: 8,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  primaryInfoContainer: {
    marginBottom: 16,
  }
})