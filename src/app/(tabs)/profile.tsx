import { useGroceryStore } from "@/store/grocery-store";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    colors,
    radius,
    shadows,
    spacing,
    typography,
} from "../../constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditableField = "name" | "username" | "email" | "phone";

interface FieldConfig {
  key: EditableField;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "name",
    label: "Name",
    placeholder: "Your full name",
    autoCapitalize: "words",
  },
  {
    key: "username",
    label: "Username",
    placeholder: "Your username",
    autoCapitalize: "none",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "Your email address",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "11-digit phone number (e.g. 09XXXXXXXXX)",
    keyboardType: "phone-pad",
  },
];

const TERMS_BULLETS = [
  "Users must provide accurate account information.",
  "Keep your password and account details secure.",
  "Orders depend on product availability and confirmation.",
  "Prices and promotions may change without notice.",
  "GROCIFY uses security measures to protect accounts and transactions.",
  "Report suspicious activity immediately.",
  "GROCIFY may update these terms and policies anytime.",
];

// ─── EditModal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  visible: boolean;
  field: FieldConfig | null;
  value: string;
  onChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditModal({ visible, field, value, onChange, onSave, onCancel }: EditModalProps) {
  if (!field) return null;

  // ✅ FIX: Phone field — strip non-digits and limit to 11 characters
  const handleChangeText = (text: string) => {
    if (field.key === "phone") {
      const digitsOnly = text.replace(/[^0-9]/g, "").slice(0, 11);
      onChange(digitsOnly);
    } else {
      onChange(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.modalOverlay}>
        <View style={styles.editModalCard}>
          <Text style={styles.editModalTitle}>Edit {field.label}</Text>
          <View style={styles.editInputRow}>
            <TextInput
              style={styles.editInput}
              value={value}
              onChangeText={handleChangeText}
              placeholder={field.placeholder}
              placeholderTextColor="rgba(0,0,0,0.3)"
              keyboardType={field.keyboardType ?? "default"}
              autoCapitalize={field.autoCapitalize ?? "sentences"}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSave}
              // ✅ FIX: Enforce max length of 11 for phone
              maxLength={field.key === "phone" ? 11 : undefined}
            />
          </View>

          {/* ✅ FIX: Show character counter hint for phone */}
          {field.key === "phone" && (
            <Text style={styles.phoneHint}>
              {value.length}/11 digits
            </Text>
          )}

          <View style={styles.editModalBtns}>
            <TouchableOpacity
              style={styles.editCancelBtn}
              onPress={onCancel}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.editCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editSaveBtn}
              onPress={onSave}
              accessibilityLabel="Save"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={["#7BC9BE", "#008296"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editSaveBtnGradient}
              >
                <Text style={styles.editSaveText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { setDisplayName } = useGroceryStore();

  const { signOut } = useAuth();
  const { user }    = useUser();

  const primaryEmail    = user?.primaryEmailAddress?.emailAddress ?? "";
  const defaultUsername = user?.username ?? primaryEmail.split("@")[0] ?? "";

  const [profileData, setProfileData] = useState({
    name:     user?.fullName ?? "",
    username: defaultUsername,
    email:    primaryEmail,
    phone:    user?.primaryPhoneNumber?.phoneNumber ?? "",
  });

  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (defaultUsername) setDisplayName(defaultUsername);
  }, []);

  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [editValue,    setEditValue]    = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to change your profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalPhotoUri(uri);
      setPhotoUploading(true);

      try {
        const response = await fetch(uri);
        const blob     = await response.blob();
        const file     = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        await user?.setProfileImage({ file });
      } catch {
        // Keep local preview even if Clerk upload fails silently
      } finally {
        setPhotoUploading(false);
      }
    }
  };

  const openEdit = (field: FieldConfig) => {
    setEditingField(field);
    setEditValue(profileData[field.key]);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingField) return;
    const trimmed = editValue.trim();

    if (!trimmed) {
      Alert.alert("Invalid", `${editingField.label} cannot be empty.`);
      return;
    }

    // ✅ FIX: Phone number validation — must be exactly 11 digits, numbers only
    if (editingField.key === "phone") {
      if (!/^\d{11}$/.test(trimmed)) {
        Alert.alert(
          "Invalid Phone Number",
          "Phone number must be exactly 11 digits (numbers only).\nExample: 09XXXXXXXXX"
        );
        return;
      }
    }

    try {
      if (editingField.key === "name") {
        const parts     = trimmed.split(" ");
        const firstName = parts[0];
        const lastName  = parts.slice(1).join(" ") || undefined;
        await user?.update({ firstName, lastName });
      } else if (editingField.key === "username" && user?.username !== undefined) {
        await user?.update({ username: trimmed });
      }
    } catch {
      // Silently ignore Clerk update errors
    }

    setProfileData((prev) => ({ ...prev, [editingField.key]: trimmed }));
    if (editingField.key === "name" || editingField.key === "username") {
      setDisplayName(trimmed);
    }
    setModalVisible(false);
    setEditingField(null);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingField(null);
    setEditValue("");
  };

  const doSignOut = async () => {
    try {
      if (Platform.OS === "web") {
        await signOut({ redirectUrl: window.location.origin });
      } else {
        await signOut();
      }
    } catch (e) {
      console.error("[ProfileScreen] signOut failed:", e);
      Alert.alert("Error", "Could not log out. Please try again.");
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) doSignOut();
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log Out", style: "destructive", onPress: doSignOut },
        ],
        { cancelable: true }
      );
    }
  };

  const initials = (profileData.name || profileData.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const resolvedPhotoUri = localPhotoUri ?? user?.imageUrl ?? null;

  return (
    <LinearGradient
      colors={["#7BC9BE", "#008296"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── TOP NAV ─────────────────────────────────────── */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={25} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Profile</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── USER CARD ─────────────────────────────────── */}
          <View style={styles.userCard}>

            {/* Teal accent strip */}
            <LinearGradient
              colors={["#7BC9BE", "#008296"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardAccentStrip}
            />

            <View style={styles.cardBody}>

              {/* ── Avatar centered + name stacked ── */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  style={styles.avatarRing}
                  accessibilityLabel="Change profile photo"
                  accessibilityRole="button"
                  activeOpacity={0.85}
                >
                  <View style={styles.avatarImageClip}>
                    {resolvedPhotoUri ? (
                      <Image source={{ uri: resolvedPhotoUri }} style={styles.avatarImage} />
                    ) : (
                      <LinearGradient colors={["#7BC9BE", "#008296"]} style={styles.avatarFallback}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                      </LinearGradient>
                    )}
                  </View>

                  <View style={styles.cameraBadge}>
                    {photoUploading
                      ? <Ionicons name="reload-outline" size={10} color="#fff" />
                      : <Ionicons name="camera" size={11} color="#fff" />}
                  </View>
                </TouchableOpacity>

                <Text style={styles.userName} numberOfLines={1}>
                  {profileData.name || profileData.username}
                </Text>

                {profileData.name && profileData.username ? (
                  <View style={styles.handlePill}>
                    <Ionicons name="at" size={10} color="#008296" />
                    <Text style={styles.handleText}>{profileData.username}</Text>
                  </View>
                ) : null}
              </View>

              {/* ── Divider ── */}
              <View style={styles.divider} />

              {/* ── Contact rows ── */}
              <View style={styles.contactBlock}>
                <View style={styles.contactRow}>
                  <View style={styles.contactIconBox}>
                    <Ionicons name="mail-outline" size={14} color="#008296" />
                  </View>
                  <Text style={styles.contactText} numberOfLines={1}>
                    {profileData.email || "—"}
                  </Text>
                </View>

                {profileData.phone ? (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIconBox}>
                      <Ionicons name="call-outline" size={14} color="#008296" />
                    </View>
                    <Text style={styles.contactText} numberOfLines={1}>
                      {profileData.phone}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ── Logout — full-width subtle row ── */}
              <TouchableOpacity
                style={styles.logoutRow}
                onPress={handleLogout}
                accessibilityLabel="Log out"
                accessibilityRole="button"
              >
                <Ionicons name="log-out-outline" size={15} color="#E74C3C" />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* ── USER ACCOUNT SECTION ──────────────────────── */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>User account</Text>
            <Text style={styles.sectionSub}>
              Manage your personal information, account settings, and shopping preferences in GROCIFY.
            </Text>

            {/* ── Profile Photo field row ── */}
            <TouchableOpacity
              style={[styles.fieldRow, styles.photoFieldRow]}
              onPress={handlePickPhoto}
              accessibilityLabel="Change profile photo"
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <View style={styles.photoFieldLeft}>
                <View style={styles.miniAvatarRing}>
                  <View style={styles.miniAvatarClip}>
                    {resolvedPhotoUri ? (
                      <Image source={{ uri: resolvedPhotoUri }} style={styles.miniAvatarImage} />
                    ) : (
                      <LinearGradient colors={["#7BC9BE", "#008296"]} style={styles.miniAvatarFallback}>
                        <Text style={styles.miniAvatarInitials}>{initials}</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.miniCamBadge}>
                    <Ionicons name="camera" size={8} color="#fff" />
                  </View>
                </View>

                <View style={styles.fieldLeft}>
                  <Text style={styles.fieldLabel}>Profile photo</Text>
                  <Text style={styles.fieldValue}>
                    {photoUploading ? "Uploading…" : "Tap to upload a photo"}
                  </Text>
                </View>
              </View>

              <View style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.editText}>Edit</Text>
              </View>
            </TouchableOpacity>

            {/* ── Other fields ── */}
            {FIELD_CONFIGS.map((field, idx) => (
              <View
                key={field.key}
                style={[styles.fieldRow, idx < FIELD_CONFIGS.length - 1 && styles.fieldRowBorder]}
              >
                <View style={styles.fieldLeft}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue} numberOfLines={1}>
                    {profileData[field.key] || "—"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openEdit(field)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={`Edit ${field.label}`}
                  accessibilityRole="button"
                  style={styles.editBtn}
                >
                  <Ionicons name="pencil-outline" size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* ── TERMS & POLICIES ──────────────────────────── */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>GROCIFY Terms &amp; Policies</Text>
            <Text style={styles.termsIntro}>
              Welcome to GROCIFY. By using our system, you agree to follow our terms and policies.
            </Text>

            {TERMS_BULLETS.map((point, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}

            <Text style={styles.termsFooter}>
              By continuing to use GROCIFY, you agree to these Terms &amp; Policies.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* ── EDIT MODAL ───────────────────────────────────── */}
      <EditModal
        visible={modalVisible}
        field={editingField}
        value={editValue}
        onChange={setEditValue}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  topNavTitle: {
    color: colors.white,
    fontSize: typography.xl,
    fontWeight: typography.bold,
  },

  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },

  // ── User Card ──────────────────────────────────────────
  userCard: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    ...shadows.card,
  },
  cardAccentStrip: {
    height: 5,
    width: "100%",
  },
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // ── Avatar section ─────────────────────────────────────
  avatarSection: {
    alignItems: "center",
    gap: 6,
  },
  avatarRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: "#7BC9BE",
    overflow: "visible",
    shadowColor: "#008296",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 2,
  },
  avatarImageClip: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: "hidden",
  },
  avatarImage: { width: 74, height: 74 },
  avatarFallback: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#008296",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0D1F22",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  handlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,130,150,0.07)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  handleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#008296",
  },

  // ── Divider ────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "rgba(0,130,150,0.1)",
  },

  // ── Contact rows ───────────────────────────────────────
  contactBlock: { gap: 7 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  contactIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "rgba(0,130,150,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(0,0,0,0.5)",
  },

  // ── Logout row ─────────────────────────────────────────
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: "rgba(231,76,60,0.06)",
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.15)",
  },
  logoutText: {
    color: "#E74C3C",
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Glass Card ─────────────────────────────────────────
  glassCard: {
    backgroundColor: "rgba(0,0,0,0.09)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.xl,
    fontWeight: "900",
    marginBottom: 6,
  },
  sectionSub: {
    color: "rgba(240,235,235,0.7)",
    fontSize: typography.xs,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: spacing.lg,
  },

  photoFieldRow: { marginBottom: spacing.sm },
  photoFieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  miniAvatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#7BC9BE",
    overflow: "visible",
    flexShrink: 0,
  },
  miniAvatarClip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  miniAvatarImage: { width: 40, height: 40 },
  miniAvatarFallback: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarInitials: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  miniCamBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#008296",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
  },

  // ── Field rows ─────────────────────────────────────────
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldRowBorder: {},
  fieldLeft: { flex: 1, paddingRight: spacing.sm },
  fieldLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  fieldValue: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  editText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "700",
  },

  // ── Terms ──────────────────────────────────────────────
  termsIntro: {
    color: "rgba(240,235,235,0.7)",
    fontSize: typography.xs,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 5,
  },
  bullet: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: "700",
    lineHeight: 17,
  },
  bulletText: {
    flex: 1,
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: "700",
    lineHeight: 17,
  },
  termsFooter: {
    color: "rgba(240,235,235,0.7)",
    fontSize: typography.xs,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: spacing.md,
  },

  // ── Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  editModalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
    ...shadows.card,
  },
  editModalTitle: {
    fontSize: typography.lg,
    fontWeight: "900",
    color: colors.textPrimary ?? "#111",
    marginBottom: spacing.md,
  },
  editInputRow: {
    backgroundColor: "#F0FAFA",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#C6E7EC",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 46,
    justifyContent: "center",
  },
  editInput: {
    flex: 1,
    color: "#006070",
    fontSize: typography.base,
    height: 46,
  },

  // ✅ NEW: Phone digit counter hint
  phoneHint: {
    fontSize: 11,
    color: "rgba(0,130,150,0.6)",
    fontWeight: "600",
    textAlign: "right",
    marginBottom: spacing.md,
    marginTop: 2,
  },

  editModalBtns: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  editCancelText: {
    color: "#888",
    fontWeight: typography.bold,
    fontSize: typography.base,
  },
  editSaveBtn: {
    flex: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  editSaveBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  editSaveText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: typography.base,
  },
});