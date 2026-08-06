import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Modulus-Medium": require("@assets/fonts/Arkitype - Modulus Pro Medium.otf"),
    "Modulus-Bold": require("@assets/fonts/Arkitype - Modulus Pro Bold.otf"),
    "Poppins-Regular": require("@assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Medium": require("@assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("@assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@assets/fonts/Poppins-SemiBold.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#ffffff" }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
