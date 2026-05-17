import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useUser } from "@clerk/expo";
import { colors, radius, spacing, shadows, typography } from "../../constants/theme";

// ─── Terms & Policies content ─────────────────────────────────────────────────

const TERMS_BULLETS = [
  "Users must provide accurate account information.",
  "Keep your password and account details secure.",
  "GROCIFY protects user information and privacy.",
  "Personal data is only used for orders, deliveries, and account management.",
  "Orders depend on product availability and confirmation.",
  "Prices and promotions may change without notice.",
  "Users may receive notifications about orders and account activity.",
  "GROCIFY uses security measures to protect accounts and transactions.",
  "Report suspicious activity immediately.",
  "GROCIFY may update its terms and policies anytime.",
];

// ─── Editable Field ───────────────────────────────────────────────────────────

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
  isLast?: boolean;
}

function EditableField({
  label,
  value,
  onSave,
  keyboardType = "default",
  editable = true,
  isLast = false,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const handleEdit = () => {
    if (!editable) {
      Alert.alert("Cannot Edit", "This field cannot be changed here. Please update it in your account settings.");
      return;
    }
    setDraft(value);
    setEditing(true);
  };

  const handleSave = () => {
    if (!draft.trim()) {
      Alert.alert("Invalid", "This field cannot be empty.");
      return;
    }
    onSave(draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <View style={[fieldStyles.container, isLast && { borderBottomWidth: 0 }]}>
      <Text style={fieldStyles.label}>{label}</Text>

      {editing ? (
        <View style={fieldStyles.editRow}>
          <TextInput
            style={fieldStyles.input}
            value={draft}
            onChangeText={setDraft}
            keyboardType={keyboardType}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            accessibilityLabel={`Edit ${label}`}
          />
          <TouchableOpacity onPress={handleSave} style={fieldStyles.saveBtn}>
            <Text style={fieldStyles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            style={fieldStyles.cancelBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={fieldStyles.viewRow}>
          <Text style={fieldStyles.value} numberOfLines={1}>
            {value || "—"}
          </Text>
          <TouchableOpacity
            onPress={handleEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Edit ${label}`}
            accessibilityRole="button"
          >
            <Text style={fieldStyles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.50)",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    flex: 1,
  },
  editText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    marginLeft: spacing.md,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(255,255,255,0.5)",
    paddingVertical: 4,
  },
  saveBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },
  cancelBtn: {
    padding: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user }    = useUser();

  const [displayName, setDisplayName] = useState(
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? "—"
  );
  const [phone, setPhone] = useState(
    user?.phoneNumbers?.[0]?.phoneNumber ?? ""
  );

  const email    = user?.emailAddresses?.[0]?.emailAddress ?? "—";
  const username = user?.username ?? "—";

  const handleSaveName = (val: string) => {
    const parts     = val.trim().split(" ");
    const firstName = parts[0] ?? "";
    const lastName  = parts.slice(1).join(" ") ?? "";
    user?.update({ firstName, lastName }).catch(() =>
      Alert.alert("Error", "Could not update name. Please try again.")
    );
    setDisplayName(val);
  };

  const handleSavePhone = (val: string) => {
    setPhone(val);
    Alert.alert("Saved", "Phone number updated locally. Verification may be required.");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        signOut({ redirectUrl: window.location.origin }).catch(console.error);
      }
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => signOut().catch(console.error),
        },
      ]);
    }
  };

  return (
    <LinearGradient
      colors={["#7BC9BE", "#008296"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── TOP NAV — matches Figma: back arrow left, "Profile" centered ── */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {/* navigation.goBack() */}}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={25} color={colors.white} strokeWidth={4} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── PROFILE HERO CARD — white/90 card, avatar left, name + email ── */}
          <View style={styles.profileCard}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={colors.teal} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
          </View>

          {/* ── USER ACCOUNT SECTION ─────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User account</Text>
            <Text style={styles.sectionSub}>
              Manage your personal information, account settings, and shopping preferences in GROCIFY.
            </Text>

            <View style={styles.fieldsCard}>
              <EditableField
                label="Name"
                value={displayName}
                onSave={handleSaveName}
              />
              <EditableField
                label="Username"
                value={username}
                onSave={() => {}}
                editable={false}
              />
              <EditableField
                label="Email"
                value={email}
                onSave={() => {}}
                keyboardType="email-address"
                editable={false}
              />
              {/* Phone — last field, no bottom border */}
              <View style={[fieldStyles.container, { borderBottomWidth: 0 }]}>
                <Text style={fieldStyles.label}>Phone Number</Text>
                <View style={fieldStyles.viewRow}>
                  <Text style={fieldStyles.value}>{phone || "Not set"}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.prompt
                        ? Alert.prompt(
                            "Phone Number",
                            "Enter your phone number",
                            (val) => val && handleSavePhone(val),
                            "plain-text",
                            phone
                          )
                        : Alert.alert("Edit Phone", "Phone editing available on iOS native.");
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={fieldStyles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* ── TERMS & POLICIES SECTION ──────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GROCIFY Terms &amp; Policies</Text>

            <View style={styles.termsCard}>
              <Text style={styles.termsIntro}>
                Welcome to GROCIFY. By using our system, you agree to follow our terms and policies.
              </Text>

              {TERMS_BULLETS.map((bullet, i) => (
                <Text key={i} style={styles.bulletText}>
                  {bullet}
                </Text>
              ))}

              <Text style={styles.termsFooter}>
                By continuing to use GROCIFY, you agree to these Terms &amp; Policies.
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: { paddingBottom: 120 },

  // ── Top nav — back arrow + centered title (matches Figma) ─────────────
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: spacing.lg,
  },
  topNavTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.2,
  },

  // ── Profile hero card — white bg, rounded, avatar + info ─────────────
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.90)",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.white,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F8F6",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.60)",
  },

  // ── Section wrapper ───────────────────────────────────────────────────
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.white,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(240,235,235,0.70)",
    lineHeight: 17,
    marginBottom: spacing.md,
  },

  // ── Fields card — translucent dark teal, rounded ──────────────────────
  fieldsCard: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.white,
    overflow: "hidden",
  },

  // ── Terms card ────────────────────────────────────────────────────────
  termsCard: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.white,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  termsIntro: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(240,235,235,0.70)",
    lineHeight: 17,
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 18,
  },
  termsFooter: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(240,235,235,0.70)",
    lineHeight: 17,
    marginTop: spacing.sm,
  },
});