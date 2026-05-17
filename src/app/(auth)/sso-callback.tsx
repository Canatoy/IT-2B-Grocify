import { useSSO } from "@clerk/expo";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function SSOCallback() {
  const { startSSOFlow } = useSSO();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Clerk handles the callback automatically via the params
    // The (auth)/_layout.tsx will redirect once isSignedIn = true
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}