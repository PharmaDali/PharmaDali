import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Modulus-Medium": require("@assets/fonts/Arkitype - Modulus Pro Medium.otf"),
    "Modulus-Bold": require("@assets/fonts/Arkitype - Modulus Pro Bold.otf"),
    "Poppins-Medium": require("@assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("@assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@assets/fonts/Poppins-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/CreateNewPasswordFPW" />
        <Stack.Screen name="auth/EnterMobileNumberFPW" />
        <Stack.Screen name="auth/EnterOTPFPW" />
        <Stack.Screen name="auth/Register" />
        <Stack.Screen name="tabs" />
      </Stack>
    </SafeAreaProvider>
  );
}
