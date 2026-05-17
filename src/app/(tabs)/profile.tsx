<<<<<<< HEAD
=======
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
    placeholder: "Your phone number",
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
              onChangeText={onChange}
              placeholder={field.placeholder}
              placeholderTextColor="rgba(0,0,0,0.3)"
              keyboardType={field.keyboardType ?? "default"}
              autoCapitalize={field.autoCapitalize ?? "sentences"}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSave}
            />
          </View>
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

  // ── Photo upload state ──────────────────────────────────
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (defaultUsername) setDisplayName(defaultUsername);
  }, []);

  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [editValue,    setEditValue]    = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // ── Photo picker handler ────────────────────────────────
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

  // ── Field edit handlers ─────────────────────────────────
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

  // Initials fallback
  const initials = (profileData.name || profileData.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Resolved photo URI: local pick > Clerk cloud > null (show initials)
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

              {/* Top row: avatar + name + logout pill */}
              <View style={styles.topRow}>

                {/* ── Avatar with camera badge ── */}
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  style={styles.avatarRing}
                  accessibilityLabel="Change profile photo"
                  accessibilityRole="button"
                  activeOpacity={0.85}
                >
                  {/* Clipping wrapper keeps circle crop */}
                  <View style={styles.avatarImageClip}>
                    {resolvedPhotoUri ? (
                      <Image
                        source={{ uri: resolvedPhotoUri }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={["#7BC9BE", "#008296"]}
                        style={styles.avatarFallback}
                      >
                        <Text style={styles.avatarInitials}>{initials}</Text>
                      </LinearGradient>
                    )}
                  </View>

                  {/* Camera badge */}
                  <View style={styles.cameraBadge}>
                    {photoUploading ? (
                      <Ionicons name="reload-outline" size={10} color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={11} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.nameBlock}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {profileData.username}
                  </Text>
                  {profileData.name ? (
                    <Text style={styles.fullName} numberOfLines={1}>
                      {profileData.name}
                    </Text>
                  ) : null}
                </View>

                {/* Compact logout pill — top-right */}
                <TouchableOpacity
                  style={styles.logoutPill}
                  onPress={handleLogout}
                  accessibilityLabel="Log out"
                  accessibilityRole="button"
                >
                  <Ionicons name="log-out-outline" size={13} color="#E74C3C" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Contact rows */}
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
                {/* Mini avatar */}
                <View style={styles.miniAvatarRing}>
                  <View style={styles.miniAvatarClip}>
                    {resolvedPhotoUri ? (
                      <Image
                        source={{ uri: resolvedPhotoUri }}
                        style={styles.miniAvatarImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={["#7BC9BE", "#008296"]}
                        style={styles.miniAvatarFallback}
                      >
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
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Top row
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  // ── Avatar ring (tappable, overflow visible for badge) ──
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    borderColor: "#7BC9BE",
    overflow: "visible",          // visible so camera badge peeks out
    flexShrink: 0,
    shadowColor: "#008296",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  // Inner clip keeps the photo/initials circular
  avatarImageClip: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
  },
  avatarImage: {
    width: 62,
    height: 62,
  },
  avatarFallback: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Camera badge on main avatar
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#008296",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  nameBlock: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0D1F22",
    letterSpacing: -0.3,
  },
  fullName: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.38)",
  },

  // Compact logout pill
  logoutPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(231,76,60,0.07)",
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.18)",
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  logoutText: {
    color: "#E74C3C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(0,130,150,0.1)",
  },

  // Contact rows
  contactBlock: {
    gap: 7,
  },
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

  // ── Profile photo field row ────────────────────────────
  photoFieldRow: {
    marginBottom: spacing.sm,
  },
  photoFieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  // Mini avatar inside the field row
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
  miniAvatarImage: {
    width: 40,
    height: 40,
  },
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
    marginBottom: spacing.lg,
    height: 46,
    justifyContent: "center",
  },
  editInput: {
    flex: 1,
    color: "#006070",
    fontSize: typography.base,
    height: 46,
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
>>>>>>> Improved-Profile
