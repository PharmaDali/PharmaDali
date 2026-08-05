import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Modulus-Medium": require("@assets/fonts/Arkitype - Modulus Pro Medium.otf"),
    "Modulus-Bold": require("@assets/fonts/Arkitype - Modulus Pro Bold.otf"),
    "Poppins-Medium": require("@assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("@assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@assets/fonts/Poppins-SemiBold.ttf"),
  });

  // If fonts are still loading (and there's no error), show a spinner
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    );
  }

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
