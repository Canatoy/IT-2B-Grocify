import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  radius,
  spacing,
  shadows,
  typography,
} from "../../constants/theme";
import { useGroceryStore, GroceryCategory, GroceryPriority } from "@/store/grocery-store";

// ─── Image assets ─────────────────────────────────────────────────────────────

const groceryBanner = require("../../../assets/images/grocery-banner.jpg");

const CATEGORY_IMAGES: Record<string, any> = {
  Fruits:     require("../../../assets/images/categories/fruits.jpg"),
  Vegetables: require("../../../assets/images/categories/vegetables.jpg"),
  Dairy:      require("../../../assets/images/categories/dairy.jpg"),
  Snacks:     require("../../../assets/images/categories/snacks.jpg"),
  Pantry:     require("../../../assets/images/categories/pantry.jpg"),
  Grain:      require("../../../assets/images/categories/grain.jpg"),
  Meat:       require("../../../assets/images/categories/meat.jpg"),
  Seafood:    require("../../../assets/images/categories/seafood.jpg"),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 3) / 4;

const SCROLL_BOTTOM_PADDING = 120;
const MODAL_BOTTOM_PADDING = 44;

export const CATEGORIES = [
  { id: "1", name: "Fruits"     },
  { id: "2", name: "Vegetables" },
  { id: "3", name: "Dairy"      },
  { id: "4", name: "Snacks"     },
  { id: "5", name: "Pantry"     },
  { id: "6", name: "Grain"      },
  { id: "7", name: "Meat"       },
  { id: "8", name: "Seafood"    },
];

export const FREQUENT_ITEMS = [
  { id: "1", name: "Avocado", category: "Fruits"  as GroceryCategory, emoji: "🥑" },
  { id: "2", name: "Milk",    category: "Dairy"   as GroceryCategory, emoji: "🥛" },
  { id: "3", name: "Bread",   category: "Grain"   as GroceryCategory, emoji: "🍞" },
  { id: "4", name: "Eggs",    category: "Dairy"   as GroceryCategory, emoji: "🥚" },
  { id: "5", name: "Sugar",   category: "Pantry"  as GroceryCategory, emoji: "🍬" },
  { id: "6", name: "Rice",    category: "Pantry"  as GroceryCategory, emoji: "🍚" },
];

export const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "#2ECC71", bg: "rgba(46,204,113,0.15)" },
  medium: { label: "Medium", color: "#F39C12", bg: "rgba(243,156,18,0.15)" },
  high:   { label: "High",   color: "#E74C3C", bg: "rgba(231,76,60,0.15)"  },
};

// ─── SuccessToast ─────────────────────────────────────────────────────────────

interface ToastProps {
  toastKey: number;
  itemName: string;
  onDone: () => void;
}

function SuccessToast({ toastKey, itemName, onDone }: ToastProps) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toastKey === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    opacity.setValue(0);
    translateY.setValue(16);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -8, duration: 280, useNativeDriver: true }),
        ]).start(onDone);
      }, 2000);
    });

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toastKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (toastKey === 0) return null;

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Added ${itemName} to your list`}
    >
      <View style={styles.toastIconWrap}>
        <Ionicons name="checkmark-circle" size={22} color="#2ECC71" />
      </View>
      <View style={styles.toastBody}>
        <Text style={styles.toastTitle}>Added to list!</Text>
        <Text style={styles.toastSub} numberOfLines={1}>{itemName}</Text>
      </View>
      <TouchableOpacity
        onPress={onDone}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── PlannerScreen ────────────────────────────────────────────────────────────

export default function PlannerScreen() {
  const { addItem, items } = useGroceryStore();

  const pendingCount      = items.filter((i) => !i.purchased).length;
  const highPriorityCount = items.filter((i) => !i.purchased && i.priority === "high").length;
  const totalUnits        = items.filter((i) => !i.purchased).reduce((s, i) => s + i.quantity, 0);

  const [itemName,          setItemName]          = useState("");
  const [quantity,          setQuantity]          = useState("1");
  const [quantityError,     setQuantityError]     = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState<GroceryCategory | "">("");
  const [selectedPriority,  setSelectedPriority]  = useState<GroceryPriority>("low");
  const [showFrequent,      setShowFrequent]      = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading,           setLoading]           = useState(false);

  const [toastKey,      setToastKey]      = useState(0);
  const [toastItemName, setToastItemName] = useState("");

  const addingRef = useRef(false);

  const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

  const showToast = useCallback((name: string) => {
    setToastItemName(name);
    setToastKey((k) => k + 1);
  }, []);

  const parseQuantity = (raw: string): number | null => {
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) return null;
    return n;
  };

  const handleQuantityChange = (text: string) => {
    setQuantity(text);
    if (text && parseQuantity(text) === null) {
      setQuantityError("Enter a whole number greater than 0");
    } else {
      setQuantityError("");
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !selectedCategory) return;
    if (addingRef.current) return;

    const qty = parseQuantity(quantity);
    if (qty === null) {
      setQuantityError("Enter a whole number greater than 0");
      return;
    }

    addingRef.current = true;
    setLoading(true);
    try {
      const name = itemName.trim();
      await addItem({ name, category: selectedCategory, quantity: qty, priority: selectedPriority });
      showToast(name);
      setItemName("");
      setQuantity("1");
      setQuantityError("");
      setSelectedCategory("");
      setSelectedPriority("low");
    } catch (err) {
      console.error("[PlannerScreen] addItem failed:", err);
      Alert.alert("Couldn't add item", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      addingRef.current = false;
    }
  };

  const handleQuickAdd = async (item: (typeof FREQUENT_ITEMS)[0]) => {
    if (addingRef.current) return;
    addingRef.current = true;
    setLoading(true);
    try {
      await addItem({ name: item.name, category: item.category, quantity: 1, priority: "low" });
      setShowFrequent(false);
      setTimeout(() => showToast(item.name), 350);
    } catch (err) {
      console.error("[PlannerScreen] quickAdd failed:", err);
      Alert.alert("Couldn't add item", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      addingRef.current = false;
    }
  };

  const canAdd = itemName.trim().length > 0 && selectedCategory !== "" && !quantityError;

  return (
    <LinearGradient
      colors={["#7BC9BE", "#008296"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <SuccessToast
          toastKey={toastKey}
          itemName={toastItemName}
          onDone={() => setToastKey(0)}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SCROLL_BOTTOM_PADDING }}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── HERO CARD ─────────────────────────── */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>GROCERY PLANNER</Text>
              <Text style={styles.heroTitle}>Plan smarter, shop calmer.</Text>
              <View style={styles.statBoxRow}>
                {[
                  { value: pendingCount,      label: "Pending" },
                  { value: highPriorityCount, label: "High Priority" },
                  { value: totalUnits,        label: "Total Units" },
                ].map((s) => (
                  <LinearGradient
                    key={s.label}
                    colors={["#7BC9BE", "#009aad"]}
                    style={styles.statBox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.statBoxValue}>{s.value}</Text>
                    <Text style={styles.statBoxLabel}>{s.label}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            {/* ── FREQUENTLY BOUGHT BANNER ─────────── */}
            <TouchableOpacity
              onPress={() => setShowFrequent(true)}
              activeOpacity={0.88}
              accessibilityLabel="Frequently bought items. Tap to view all."
              accessibilityRole="button"
              style={styles.frequentBannerWrapper}
            >
              <ImageBackground
                source={groceryBanner}
                style={styles.frequentBanner}
                imageStyle={styles.frequentBannerImage}
                resizeMode="cover"
              >
                {/* dark overlay so text stays readable over any photo */}
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={styles.frequentTitle}>Frequently bought items</Text>
                  <Text style={styles.frequentSub}>Quickly add items you buy often.</Text>
                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.white} style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            {/* ── CATEGORIES ───────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity
                  onPress={() => setShowAllCategories(!showAllCategories)}
                  style={styles.seeAllBtn}
                  accessibilityLabel={showAllCategories ? "Show fewer categories" : "See all categories"}
                  accessibilityRole="button"
                >
                  <Text style={styles.seeAll}>{showAllCategories ? "Show less" : "See all"}</Text>
                  <Ionicons name={showAllCategories ? "chevron-up" : "chevron-down"} size={12} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>

              <View style={styles.categoryGrid}>
                {displayedCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  const catImage = CATEGORY_IMAGES[cat.name];

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.name as GroceryCategory)}
                      activeOpacity={0.82}
                      style={[
                        styles.categoryCardWrapper,
                        { width: CARD_SIZE, height: CARD_SIZE },
                        isSelected && styles.categorySelectedWrapper,
                      ]}
                      accessibilityLabel={`${cat.name} category${isSelected ? ", selected" : ""}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <ImageBackground
                        source={catImage}
                        style={styles.categoryImageBg}
                        imageStyle={styles.categoryImageStyle}
                        resizeMode="cover"
                      >
                        {/* dark tint so label is always readable */}
                        <View style={styles.categoryOverlay} />

                        {isSelected && (
                          <View style={styles.categoryCheckmark}>
                            <Ionicons name="checkmark" size={10} color={colors.white} />
                          </View>
                        )}

                        <Text style={styles.categoryName}>{cat.name}</Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── BUILD YOUR LIST FORM ─────────────── */}
            <View style={styles.section}>
              <Text style={styles.buildTitle}>BUILD YOUR LIST</Text>
              <Text style={styles.buildSub}>Fill in details, then tap Add to List.</Text>

              <View style={styles.formCard}>

                {/* Item Name */}
                <Text style={styles.inputLabel}>Item name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="bag-outline" size={16} color={colors.teal} style={{ marginRight: spacing.sm }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Squash"
                    placeholderTextColor={colors.tealLight}
                    value={itemName}
                    onChangeText={setItemName}
                    returnKeyType="next"
                    accessibilityLabel="Item name"
                  />
                  {itemName.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setItemName("")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Clear item name"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close-circle" size={16} color={colors.tealLight} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Quantity */}
                <Text style={styles.inputLabel}>Quantity</Text>
                <View style={[styles.inputRow, quantityError ? styles.inputRowError : null]}>
                  <Ionicons name="pricetag-outline" size={16} color={colors.teal} style={{ marginRight: spacing.sm }} />
                  <TextInput
                    style={styles.input}
                    placeholder="E.g. 3"
                    placeholderTextColor={colors.tealLight}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    returnKeyType="done"
                    accessibilityLabel="Quantity"
                  />
                </View>
                {quantityError ? (
                  <Text style={styles.inputError}>{quantityError}</Text>
                ) : null}

                {/* Priority */}
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                  {(["low", "medium", "high"] as GroceryPriority[]).map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const isActive = selectedPriority === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityBtn,
                          isActive && { backgroundColor: cfg.bg, borderColor: cfg.color },
                        ]}
                        onPress={() => setSelectedPriority(p)}
                        accessibilityLabel={`${cfg.label} priority`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isActive }}
                      >
                        <View style={[styles.priorityDot, { backgroundColor: cfg.color }]} />
                        <Text style={[styles.priorityBtnText, isActive && { color: cfg.color, fontWeight: typography.bold }]}>
                          {cfg.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Category indicator */}
                <View style={[styles.selectedCatRow, selectedCategory ? styles.selectedCatRowActive : {}]}>
                  <Ionicons
                    name={selectedCategory ? "checkmark-circle" : "alert-circle-outline"}
                    size={15}
                    color={selectedCategory ? "#2ECC71" : "rgba(255,255,255,0.45)"}
                  />
                  <Text style={[styles.selectedCatText, selectedCategory && { color: "rgba(255,255,255,0.9)" }]}>
                    {selectedCategory ? `Category: ${selectedCategory}` : "No category selected — tap one above"}
                  </Text>
                </View>

                {/* Add button */}
                <TouchableOpacity
                  style={[styles.addBtn, (!canAdd || loading) && styles.addBtnDisabled]}
                  onPress={handleAddItem}
                  disabled={!canAdd || loading}
                  activeOpacity={0.85}
                  accessibilityLabel="Add to list"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canAdd || loading }}
                >
                  <LinearGradient
                    colors={canAdd ? ["#7BC9BE", "#008296"] : ["#C5DDD9", "#A8CBCA"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.addBtnGradient}
                  >
                    <Ionicons name={loading ? "hourglass-outline" : "add-circle-outline"} size={20} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.addBtnText}>{loading ? "Adding…" : "Add to List"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── MODAL: Frequently Bought ──────────── */}
        <Modal
          visible={showFrequent}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFrequent(false)}
          accessibilityViewIsModal
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Frequently Bought</Text>
                <TouchableOpacity
                  onPress={() => setShowFrequent(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close frequently bought"
                  accessibilityRole="button"
                >
                  <View style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={16} color={colors.teal} />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Tap an item to instantly add it to your list.</Text>

              {FREQUENT_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.frequentItem}
                  onPress={() => handleQuickAdd(item)}
                  disabled={loading}
                  activeOpacity={0.78}
                  accessibilityLabel={`Add ${item.name}, ${item.category}`}
                  accessibilityRole="button"
                >
                  <View style={styles.frequentEmojiWrap}>
                    <Text style={styles.frequentItemEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.frequentItemName}>{item.name}</Text>
                    <Text style={styles.frequentItemCat}>{item.category}</Text>
                  </View>
                  <View style={styles.quickAddBtn}>
                    <Ionicons name="add-circle-outline" size={18} color={colors.teal} />
                    <Text style={styles.quickAddText}>Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Toast ─────────────────────────────────────────────────
  toast: {
    position: "absolute",
    top: 12,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
    backgroundColor: "rgba(18, 58, 60, 0.97)",
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...shadows.card,
  },
  toastIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(46,204,113,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  toastBody: { flex: 1 },
  toastTitle: { color: colors.white, fontWeight: typography.bold, fontSize: typography.base },
  toastSub: { color: "rgba(255,255,255,0.55)", fontSize: typography.xs, marginTop: 2 },

  // ── Hero ──────────────────────────────────────────────────
  heroCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  heroLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    fontWeight: typography.semibold,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.xxl,
    fontWeight: "900" as const,
    color: colors.teal,
    marginBottom: spacing.md,
  },
  statBoxRow: { flexDirection: "row", gap: spacing.sm },
  statBox: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minHeight: 52,
  },
  statBoxValue: { fontSize: typography.xl, fontWeight: "900" as const, color: colors.white },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: typography.semibold,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },

  // ── Frequent Banner ───────────────────────────────────────
  // Outer wrapper keeps margin + shadow; ImageBackground is inside
  frequentBannerWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",      // clips the image to the rounded corners
    ...shadows.card,
  },
  frequentBanner: {
    minHeight: 120,
    justifyContent: "center",
  },
  frequentBannerImage: {
    // Image fills the card naturally via resizeMode="cover"
    // borderRadius is NOT set here — overflow:hidden on wrapper handles it
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 90, 100, 0.55)",   // teal-tinted dark overlay
  },
  bannerContent: {
    padding: spacing.lg,
    maxWidth: "65%",          // keeps text from overlapping the right side of the photo
  },
  frequentTitle: { color: colors.white, fontWeight: typography.bold, fontSize: typography.lg },
  frequentSub: { color: "rgba(255,255,255,0.75)", fontSize: typography.sm, marginTop: 3, marginBottom: spacing.md },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  viewBtnText: { color: colors.white, fontWeight: typography.bold, fontSize: typography.sm },

  // ── Section ───────────────────────────────────────────────
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  sectionTitle: { color: colors.white, fontWeight: typography.bold, fontSize: typography.lg },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { color: "rgba(255,255,255,0.7)", fontSize: typography.sm, fontWeight: typography.medium },

  // ── Category Grid ─────────────────────────────────────────
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryCardWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",       // clips photo + overlay to rounded corners
    borderWidth: 2.5,
    borderColor: "transparent",
    ...shadows.card,
  },
  categorySelectedWrapper: { borderColor: colors.white },
  categoryImageBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  categoryImageStyle: {
    // resizeMode is set on the component; no extra style needed here
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",   // subtle tint — lets the photo show through
  },
  categoryCheckmark: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    color: colors.white,
    fontWeight: typography.bold,
    fontSize: 10,
    textAlign: "center",
    zIndex: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Form Card ─────────────────────────────────────────────
  buildTitle: {
    color: colors.white,
    fontWeight: typography.extrabold,
    fontSize: typography.md,
    letterSpacing: typography.wide,
    textTransform: "uppercase",
  },
  buildSub: { color: "rgba(255,255,255,0.6)", fontSize: typography.sm, marginTop: 4, marginBottom: spacing.md },
  formCard: {
    backgroundColor: "rgba(0,80,96,0.35)",
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  inputLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: typography.semibold,
    fontSize: typography.sm,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 46,
  },
  inputRowError: { borderWidth: 1.5, borderColor: "#E74C3C" },
  inputError: { color: "#FFB3A7", fontSize: typography.xs, marginBottom: spacing.md, marginLeft: 4 },
  input: { flex: 1, height: 46, color: colors.tealDark, fontSize: typography.base },
  priorityRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  priorityDot: { width: 7, height: 7, borderRadius: 3.5 },
  priorityBtnText: { color: "rgba(255,255,255,0.65)", fontSize: typography.sm, fontWeight: typography.medium },
  selectedCatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  selectedCatRowActive: { backgroundColor: "rgba(46,204,113,0.1)" },
  selectedCatText: { color: "rgba(255,255,255,0.45)", fontSize: typography.xs, fontWeight: typography.medium, flex: 1 },
  addBtn: { borderRadius: radius.md, overflow: "hidden" },
  addBtnDisabled: { opacity: 0.55 },
  addBtnGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontWeight: typography.extrabold, fontSize: typography.lg },

  // ── Modal ─────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: MODAL_BOTTOM_PADDING,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#E0E0E0", borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.textPrimary },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSub: { color: colors.textSecondary, fontSize: typography.sm, marginBottom: spacing.lg },
  frequentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3FAFA",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "#D8EEED",
  },
  frequentEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  frequentItemEmoji: { fontSize: 26 },
  frequentItemName: { fontWeight: typography.bold, fontSize: typography.base, color: colors.textPrimary },
  frequentItemCat: { fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 },
  quickAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8F8F6",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  quickAddText: { color: colors.teal, fontWeight: typography.bold, fontSize: typography.sm },
});