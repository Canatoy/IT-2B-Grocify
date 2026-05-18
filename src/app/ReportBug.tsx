import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportBugScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    contact: "yes" as "yes" | "no",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      Alert.alert("Required", "Please describe the issue before submitting.");
      return;
    }

    setSending(true);

    const to = "badanakenchie@gmail.com";
    const subject = "Bug Report" + (form.name ? " from " + form.name : "");
    const body =
      "Name: " + (form.name || "Not provided") + "\n" +
      "Email: " + (form.email || "Not provided") + "\n" +
      "May contact: " + (form.contact === "yes" ? "Yes" : "No") + "\n\n" +
      "Description:\n" + form.description;

    try {
      if (Platform.OS === "web") {
        // Web: open Gmail compose in new tab
        const gmailUrl =
          "https://mail.google.com/mail/?view=cm&fs=1" +
          "&to=" + encodeURIComponent(to) +
          "&su=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        window.open(gmailUrl, "_blank");
        setSent(true);
      } else {
        // Native (iOS / Android)
        const isAvailable = await MailComposer.isAvailableAsync();
        if (!isAvailable) {
          // Fallback to mailto if no mail app
          await Linking.openURL(
            "mailto:" + to +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body)
          );
          setSent(true);
          return;
        }

        const result = await MailComposer.composeAsync({
          recipients: [to],
          subject,
          body,
        });

        if (
          result.status === MailComposer.MailComposerStatus.SENT ||
          result.status === MailComposer.MailComposerStatus.SAVED
        ) {
          setSent(true);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Could not send report. Please try again.");
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

                <Text style={styles.cardTitle}>Report a bug</Text>
                <Text style={styles.cardSubtitle}>
                  Help us improve your experience by reporting issues.
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

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Description <Text style={styles.required}>(required)</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="Describe the issue you encountered"
                    placeholderTextColor="#bbb"
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    May we contact you regarding your feedback?
                  </Text>
                  <View style={styles.radioGroup}>
                    {(["yes", "no"] as const).map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={styles.radioRow}
                        onPress={() => setForm({ ...form, contact: val })}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.radioOuter,
                            form.contact === val && styles.radioOuterActive,
                          ]}
                        >
                          {form.contact === val && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>
                          {val.charAt(0).toUpperCase() + val.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!form.description.trim() || sending) &&
                        styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!form.description.trim() || sending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitBtnText}>
                      {sending ? "Opening mail…" : "Send report"}
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
  radioGroup: { flexDirection: "row", gap: 24, marginTop: 4 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#008296" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#008296",
  },
  radioLabel: { fontSize: 14, color: "#222" },
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