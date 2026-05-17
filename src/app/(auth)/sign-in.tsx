import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shadows } from "../../constants/theme";
import useSocialAuth from "../hooks/useSocialAuth";

export default function SignInScreen() {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const isGoogleClicked = loadingStrategy === "oauth_google";
  const isAppleClicked = loadingStrategy === "oauth_apple";
  const isGitHubClicked = loadingStrategy === "oauth_github";
  const isLoading = isAppleClicked || isGitHubClicked || isGoogleClicked;

  return (
    <LinearGradient
      colors={["#008296", "#7BC9BE"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>

        {/* Top area — logo card centered, can be resized freely */}
        <View style={styles.topArea}>
          <View style={styles.logoCard}>
            <Image
              source={require("../../../assets/images/auth.png")}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Bottom sheet — always pinned to bottom, never moves */}
        <View style={styles.bottomSheet}>
          <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
          <Text style={styles.subtitle}>
            Choose a social provider and jump right into your professional{"\n"}
            grocery experience.
          </Text>

          {/* Google */}
          <Pressable
            style={[styles.button, isLoading && styles.disabled]}
            disabled={isLoading}
            onPress={() => handleSocialAuth("oauth_google")}
          >
            <View style={styles.iconWrap}>
              <Image
                source={require("../../../assets/images/google.png")}
                style={{ width: 20, height: 20 }}
              />
            </View>
            <Text style={styles.buttonText}>
              {isGoogleClicked ? "Connecting Google..." : "Continue with Google"}
            </Text>
            <FontAwesome name="angle-right" size={18} color="#aaa" />
          </Pressable>

          {/* GitHub */}
          <Pressable
            style={[styles.button, isLoading && styles.disabled]}
            disabled={isLoading}
            onPress={() => handleSocialAuth("oauth_github")}
          >
            <View style={styles.iconWrap}>
              <FontAwesome name="github" size={22} color="#111" />
            </View>
            <Text style={styles.buttonText}>
              {isGitHubClicked ? "Connecting GitHub..." : "Continue with GitHub"}
            </Text>
            <FontAwesome name="angle-right" size={18} color="#aaa" />
          </Pressable>

          {/* Apple */}
          <Pressable
            style={[styles.button, isLoading && styles.disabled]}
            disabled={isLoading}
            onPress={() => handleSocialAuth("oauth_apple")}
          >
            <View style={styles.iconWrap}>
              <FontAwesome6 name="apple" size={22} color="#111" />
            </View>
            <Text style={styles.buttonText}>
              {isAppleClicked ? "Connecting Apple..." : "Continue with Apple"}
            </Text>
            <FontAwesome name="angle-right" size={18} color="#aaa" />
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  topArea: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 12,
    justifyContent: "center",
  },
  logoCard: {
    width: 360,
    height: 330,
    backgroundColor: colors.white,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    ...shadows.raised,
  },
  logoImage: {
    width: 324,
    height: 324,
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  welcomeTitle: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    lineHeight: 19,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...shadows.card,
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  disabled: {
    opacity: 0.6,
  },
  terms: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 11,
    color: "#aaa",
  },
});
