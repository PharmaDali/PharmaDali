import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import theme from '@shared/inputTheme';
import { useConfirmPasswordToggle } from '@shared/confirmPasswordToggle';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DescriptiveLogo from '@shared/components/DescriptiveLogo';

const PharmacistLogin = () => {

  const router = useRouter();
  const passwordToggleIcon = useConfirmPasswordToggle();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="flex-row items-center justify-between px-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#48AAD9" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Text style={styles.tagalogText}>Tagalog</Text>
          <Ionicons name="caret-down" size={12} color="#48AAD9" />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-2">
        <DescriptiveLogo />
      </View>

      <TextInput
        label="Employee Number"
        mode="outlined"
        theme={theme}
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry={!passwordToggleIcon.showPassword}
        theme={theme}
        style={styles.input}
        right={passwordToggleIcon.icon}
      />  
      <Link href="" style={styles.forgotPassword}>Forgot Password?</Link>
      <View style={{ alignItems: 'center' }}>
        <Button mode="contained" style={styles.loginButton} onPress={() => router.replace('/pharmacist/tabs/Home')}>
          Mag-Login
        </Button>
        <Text style={styles.noAccountText}>Wala pang account?</Text>
        <Button mode="outlined" style={styles.registerButton} labelStyle={styles.registerButtonLabel} onPress={() => router.push('')}>
          Mag-Register
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default PharmacistLogin;

const styles = StyleSheet.create({
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#E53935',
    marginTop: 12,
  },
  tagalogText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#48AAD9',
    marginRight: 2,
  },
  input: {
    marginBottom: 16,
    activeOutlineColor: '#48AAD9',
  },
  loginButton: {
    borderRadius: 10,
    marginTop: 8,
    width: '50%',
    backgroundColor: '#48AAD9',
  },
  forgotPassword: {
    marginTop: 8,
    marginBottom: 16,
    color: '#48AAD9',
    textDecorationLine: 'underline',
  },
  noAccountText: {
    marginTop: 20,
    color: '#888',
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 10,
    width: '50%',
    borderColor: '#48AAD9',
  },
  registerButtonLabel: {
    color: '#48AAD9',
  }
});