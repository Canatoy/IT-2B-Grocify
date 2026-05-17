import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!form.message.trim()) {
      Alert.alert("Required", "Please enter your feedback before submitting.");
      return;
    }

    setSending(true);

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("No mail app", "No email client is set up on this device.");
        setSending(false);
        return;
      }

      const stars = form.rating > 0 ? "★".repeat(form.rating) + "☆".repeat(5 - form.rating) : "Not rated";

      const result = await MailComposer.composeAsync({
        recipients: ["badanakenchie@gmail.com"],
        subject: "Feedback" + (form.name ? " from " + form.name : ""),
        body:
          "Name: " + (form.name || "Not provided") + "\n" +
          "Email: " + (form.email || "Not provided") + "\n" +
          "Rating: " + stars + "\n\n" +
          "Feedback:\n" + form.message,
      });

      if (
        result.status === MailComposer.MailComposerStatus.SENT ||
        result.status === MailComposer.MailComposerStatus.SAVED
      ) {
        setSent(true);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open mail composer. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7BC9BE", "#008296"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {sent ? (
              /* ── Thank You Card ── */
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() =>
                    router.canGoBack()
                      ? router.back()
                      : router.replace("/(tabs)/insights")
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={26} color="#008296" />
                </TouchableOpacity>

                <View style={styles.illustrationWrap}>
                  <Image
                    source={require("@/assets/images/thank-you.png")}
                    style={styles.illustration}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.thankTitle}>Thank you!</Text>
                <Text style={styles.thankSubtitle}>
                  By sharing your voice, you help us improve Grocify.
                </Text>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => router.replace("/(tabs)/insights")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── Form Card ── */
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() =>
                    router.canGoBack()
                      ? router.back()
                      : router.replace("/(tabs)/insights")
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={26} color="#008296" />
                </TouchableOpacity>

                <Text style={styles.cardTitle}>Send feedback</Text>
                <Text style={styles.cardSubtitle}>
                  We'd love to hear what you think about Grocify.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#bbb"
                    value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.org"
                    placeholderTextColor="#bbb"
                    value={form.email}
                    onChangeText={(v) => setForm({ ...form, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Star Rating */}
                <View style={styles.field}>
                  <Text style={styles.label}>Rating</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setForm({ ...form, rating: star })}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={form.rating >= star ? "star" : "star-outline"}
                          size={32}
                          color="#008296"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Feedback <Text style={styles.required}>(required)</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="Share your thoughts or suggestions"
                    placeholderTextColor="#bbb"
                    value={form.message}
                    onChangeText={(v) => setForm({ ...form, message: v })}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!form.message.trim() || sending) &&
                        styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!form.message.trim() || sending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitBtnText}>
                      {sending ? "Opening mail…" : "Send feedback"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() =>
                      router.canGoBack()
                        ? router.back()
                        : router.replace("/(tabs)/insights")
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe:     { flex: 1 },
  kav:      { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#777",
    lineHeight: 19,
    marginBottom: 22,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  required: { fontWeight: "400", color: "#888" },
  input: {
    borderWidth: 1.5,
    borderColor: "#008296",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fff",
  },
  textarea: { height: 110, paddingTop: 10 },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  submitBtn: {
    flex: 1,
    backgroundColor: "#008296",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelBtnText: { color: "#444", fontSize: 15, fontWeight: "500" },
  illustrationWrap: { alignItems: "center", marginTop: 8, marginBottom: 16 },
  illustration: { width: "100%", height: 200 },
  thankTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#008296",
    textAlign: "center",
    marginBottom: 10,
  },
  thankSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  doneBtn: {
    backgroundColor: "#008296",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});