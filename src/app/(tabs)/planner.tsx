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

// ─── Item images ──────────────────────────────────────────────────────────────

const ITEM_IMAGES: Record<string, any> = {
  apple:    require("@/assets/images/items/apple.jpg"),
  banana:   require("@/assets/images/items/banana.jpg"),
  carrot:   require("@/assets/images/items/carrot.jpg"),
  cabbage:  require("@/assets/images/items/cabbage.jpg"),
  milk:     require("@/assets/images/items/milk.jpg"),
  cheese:   require("@/assets/images/items/cheese.jpg"),
  chips:    require("@/assets/images/items/chips.jpg"),
  chicken:  require("@/assets/images/items/chicken.jpg"),
  rice:     require("@/assets/images/items/rice.jpg"),
  shrimp:   require("@/assets/images/items/shrimp.jpg"),
  bread:    require("@/assets/images/items/bread.jpg"),
  sugar:    require("@/assets/images/items/sugar.jpg"),
};

const getItemImage = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, "");
  return ITEM_IMAGES[key] ?? null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH   = Dimensions.get("window").width;
const CARD_PADDING   = 16;
const CARD_SIZE      = (SCREEN_WIDTH - spacing.lg * 2 - CARD_PADDING * 2 - spacing.sm * 3 - 2.5 * 2 * 4) / 4;
const FREQ_CARD_SIZE = (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 3) / 4;

const SCROLL_BOTTOM_PADDING = 120;
const MODAL_BOTTOM_PADDING  = 44;
const TAB_BAR_HEIGHT        = Platform.OS === "ios" ? 83 : 60;

export const CATEGORIES = [
  { id: "1", name: "Fruits",     overlay: "rgba(180,30,30,0.72)"   },
  { id: "2", name: "Vegetables", overlay: "rgba(45,110,45,0.72)"   },
  { id: "3", name: "Dairy",      overlay: "rgba(200,175,100,0.72)" },
  { id: "4", name: "Snacks",     overlay: "rgba(160,80,20,0.72)"   },
  { id: "5", name: "Pantry",     overlay: "rgba(140,90,40,0.72)"   },
  { id: "6", name: "Grain",      overlay: "rgba(190,150,60,0.72)"  },
  { id: "7", name: "Meat",       overlay: "rgba(160,40,40,0.72)"   },
  { id: "8", name: "Seafood",    overlay: "rgba(30,100,160,0.72)"  },
];

// ── Expanded to 12 items matching Figma ───────────────────────────────────────
export const FREQUENT_ITEMS = [
  { id: "1",  name: "Apple",   category: "Fruits"      as GroceryCategory },
  { id: "2",  name: "Banana",  category: "Fruits"      as GroceryCategory },
  { id: "3",  name: "Carrot",  category: "Vegetables"  as GroceryCategory },
  { id: "4",  name: "Cabbage", category: "Vegetables"  as GroceryCategory },
  { id: "5",  name: "Milk",    category: "Dairy"       as GroceryCategory },
  { id: "6",  name: "Cheese",  category: "Dairy"       as GroceryCategory },
  { id: "7",  name: "Chips",   category: "Snacks"      as GroceryCategory },
  { id: "8",  name: "Chicken", category: "Meat"        as GroceryCategory },
  { id: "9",  name: "Rice",    category: "Pantry"      as GroceryCategory },
  { id: "10", name: "Shrimp",  category: "Seafood"     as GroceryCategory },
  { id: "11", name: "Bread",   category: "Grain"       as GroceryCategory },
  { id: "12", name: "Sugar",   category: "Pantry"      as GroceryCategory },
];

export const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "#2ECC71", bg: "rgba(46,204,113,0.15)"  },
  medium: { label: "Medium", color: "#F39C12", bg: "rgba(243,156,18,0.15)"  },
  high:   { label: "High",   color: "#E74C3C", bg: "rgba(231,76,60,0.15)"   },
};

const CATEGORY_PILL: Record<string, { bg: string; color: string }> = {
  Fruits:     { bg: "#FFE8D6", color: "#8B3A0F" },
  Vegetables: { bg: "#D8F0DA", color: "#1B5E20" },
  Dairy:      { bg: "#DDEEFF", color: "#0D47A1" },
  Snacks:     { bg: "#FFF9C4", color: "#7A5800" },
  Pantry:     { bg: "#EDD9F5", color: "#4A148C" },
  Grain:      { bg: "#EDE0D4", color: "#4E342E" },
  Meat:       { bg: "#FCE4EC", color: "#880E4F" },
  Seafood:    { bg: "#E0F7FA", color: "#006064" },
};

// ─── SuccessToast ─────────────────────────────────────────────────────────────

interface ToastProps { toastKey: number; itemName: string; onDone: () => void; }

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

// ─── FrequentItemCard ─────────────────────────────────────────────────────────

interface FreqItemCardProps {
  item: (typeof FREQUENT_ITEMS)[0];
  onAdd: () => void;
  loading: boolean;
}

function FrequentItemCard({ item, onAdd, loading }: FreqItemCardProps) {
  const [hearted, setHearted] = useState(false);
  const img     = getItemImage(item.name);
  const catPill = CATEGORY_PILL[item.category] ?? { bg: "#F0F0F0", color: "#555" };

  return (
    <View style={freqStyles.card}>
      {/* Heart icon */}
      <TouchableOpacity
        style={freqStyles.heartBtn}
        onPress={() => setHearted((h) => !h)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel={hearted ? "Unfavourite" : "Favourite"}
        accessibilityRole="button"
      >
        <Ionicons
          name={hearted ? "heart" : "heart-outline"}
          size={14}
          color={hearted ? "#E53935" : "#E53935"}
        />
      </TouchableOpacity>

      {/* Image */}
      <View style={freqStyles.imgWrap}>
        {img ? (
          <Image source={img} style={freqStyles.img} resizeMode="cover" />
        ) : (
          <View style={freqStyles.imgPlaceholder}>
            <Text style={{ fontSize: 28 }}>🛒</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={freqStyles.name} numberOfLines={1}>{item.name}</Text>

      {/* Category pill */}
      <View style={[freqStyles.catPill, { backgroundColor: catPill.bg }]}>
        <Text style={[freqStyles.catPillText, { color: catPill.color }]} numberOfLines={1}>
          {item.category}
        </Text>
      </View>

      {/* Add button */}
      <TouchableOpacity
        style={freqStyles.addBtn}
        onPress={onAdd}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityLabel={`Add ${item.name}`}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={13} color={colors.teal} />
        <Text style={freqStyles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const freqStyles = StyleSheet.create({
  card: {
    width: FREQ_CARD_SIZE,
    backgroundColor: "#F7FAFA",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#E0EEEE",
    padding: 8,
    alignItems: "center",
    gap: 4,
    ...shadows.card,
  },
  heartBtn: {
    alignSelf: "flex-end",
    marginBottom: -2,
  },
  imgWrap: {
    width: FREQ_CARD_SIZE - 20,
    height: FREQ_CARD_SIZE - 20,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#EEF7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF7F7",
  },
  name: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 2,
  },
  catPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "center",
  },
  catPillText: {
    fontSize: 8,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8F8F6",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#B2E0DC",
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.teal,
  },
});

// ─── PlannerScreen ────────────────────────────────────────────────────────────

export default function PlannerScreen() {
  const { addItem, items } = useGroceryStore();

  const pendingCount      = items.filter((i) => !i.purchased).length;
  const highPriorityCount = items.filter((i) => !i.purchased && i.priority === "high").length;
  const totalUnits        = items.filter((i) => !i.purchased).reduce((s, i) => s + i.quantity, 0);

  const [itemName,          setItemName]          = useState("");
  const [quantity,          setQuantity]          = useState("1");
  const [quantityError,     setQuantityError]     = useState("");
  const [estimatedPrice,    setEstimatedPrice]    = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState<GroceryCategory | "">("");
  const [selectedPriority,  setSelectedPriority]  = useState<GroceryPriority>("low");
  const [showFrequent,      setShowFrequent]      = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading,           setLoading]           = useState(false);

  const [toastKey,      setToastKey]      = useState(0);
  const [toastItemName, setToastItemName] = useState("");

  const addingRef = useRef(false);

  const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

  const parsedPrice = parseFloat(estimatedPrice);
  const parsedQty   = parseInt(quantity, 10);
  const totalPrice  =
    !isNaN(parsedPrice) && parsedPrice > 0 && !isNaN(parsedQty) && parsedQty > 0
      ? parsedPrice * parsedQty
      : null;

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

    const price     = estimatedPrice ? parseFloat(estimatedPrice) : undefined;
    const calcTotal = price && qty ? price * qty : undefined;

    addingRef.current = true;
    setLoading(true);
    try {
      const name = itemName.trim();
      await addItem({
        name,
        category: selectedCategory,
        quantity: qty,
        priority: selectedPriority,
        estimatedPrice: price,
        totalPrice: calcTotal,
      });
      showToast(name);
      setItemName("");
      setQuantity("1");
      setQuantityError("");
      setEstimatedPrice("");
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
      setTimeout(() => showToast(item.name), 100);
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
      <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
  keyboardVerticalOffset={0}
>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <SuccessToast
            toastKey={toastKey}
            itemName={toastItemName}
            onDone={() => setToastKey(0)}
          />

          <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: SCROLL_BOTTOM_PADDING }}
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="interactive"
  automaticallyAdjustKeyboardInsets={true}
>

            {/* ── HERO CARD ─────────────────────────── */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>GROCERY PLANNER</Text>
              <Text style={styles.heroTitle}>Plan smarter, shop calmer.</Text>
              <View style={styles.statBoxRow}>
                {[
                  { value: pendingCount,      label: "PENDING"       },
                  { value: highPriorityCount, label: "HIGH PRIORITY" },
                  { value: totalUnits,        label: "TOTAL UNITS"   },
                ].map((s) => (
                  <View key={s.label} style={styles.statBox}>
                    <LinearGradient
                      colors={["#5BB8B0", "#007A8A"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.statBoxGradient}
                    >
                      <Text style={styles.statBoxLabel}>{s.label}</Text>
                      <Text style={styles.statBoxValue}>{s.value}</Text>
                    </LinearGradient>
                  </View>
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
                imageStyle={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0,130,150,0.37)", "rgba(123,201,190,0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.bannerContent}>
                  <Text style={styles.frequentTitle}>{"Frequently bought\nitems"}</Text>
                  <Text style={styles.frequentSub}>{"Quickly add items you buy\noften."}</Text>
                  <View style={styles.viewBtnRow}>
                    <View style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </View>
                    <View style={styles.viewBtnCircle}>
                      <Ionicons name="arrow-forward" size={12} color={colors.teal} />
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            {/* ── CATEGORIES ───────────────────────── */}
            <View style={styles.categoriesCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity
                  onPress={() => setShowAllCategories(!showAllCategories)}
                  style={styles.seeAllBtn}
                  accessibilityLabel={showAllCategories ? "Show fewer categories" : "See all categories"}
                  accessibilityRole="button"
                >
                  <Text style={styles.seeAll}>{showAllCategories ? "Show less" : "See all"}</Text>
                  <Ionicons
                    name={showAllCategories ? "chevron-up" : "chevron-down"}
                    size={12}
                    color="rgba(255,255,255,0.8)"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.categoryGrid}>
                {displayedCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  const catImage   = CATEGORY_IMAGES[cat.name];
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.name as GroceryCategory)}
                      activeOpacity={0.82}
                      style={[styles.categoryCardWrapper, isSelected && styles.categorySelectedWrapper]}
                      accessibilityLabel={`${cat.name} category${isSelected ? ", selected" : ""}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <ImageBackground source={catImage} style={styles.categoryTopImage} resizeMode="cover">
                        {isSelected && <View style={styles.categorySelectedOverlay} />}
                        <LinearGradient colors={["transparent", "rgba(0,0,0,0.82)"]} style={styles.categoryGradient}>
                          <Text style={styles.categoryName}>{cat.name}</Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={12} color={colors.white} />}
                        </LinearGradient>
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
                    placeholderTextColor="rgba(0,0,0,0.35)"
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
                      <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.3)" />
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
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    returnKeyType="next"
                    accessibilityLabel="Quantity"
                  />
                </View>
                {quantityError ? <Text style={styles.inputError}>{quantityError}</Text> : null}

                {/* Estimated Price */}
                <Text style={styles.inputLabel}>Estimated price</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="cash-outline" size={16} color={colors.teal} style={{ marginRight: spacing.sm }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 5.00"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="decimal-pad"
                    value={estimatedPrice}
                    onChangeText={setEstimatedPrice}
                    returnKeyType="done"
                    accessibilityLabel="Estimated price"
                  />
                  {estimatedPrice.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setEstimatedPrice("")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Clear estimated price"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.3)" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Total Price Preview */}
                {totalPrice !== null && (
                  <View style={styles.totalPreviewRow}>
                    <Ionicons name="calculator-outline" size={14} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.totalPreviewText}>
                      Estimated total:{" "}
                      <Text style={styles.totalPreviewAmount}>₱{totalPrice.toFixed(2)}</Text>
                    </Text>
                  </View>
                )}

                {/* Priority */}
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                  {(["low", "medium", "high"] as GroceryPriority[]).map((p) => {
                    const cfg      = PRIORITY_CONFIG[p];
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
                    <Ionicons
                      name={loading ? "hourglass-outline" : "add-circle-outline"}
                      size={20}
                      color={colors.white}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.addBtnText}>{loading ? "Adding…" : "Add to List"}</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* ── MODAL: Frequently Bought Items ────────────────────── */}
      <Modal
        visible={showFrequent}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFrequent(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Frequently Bought Items</Text>
                <Text style={styles.modalSub}>Showing {FREQUENT_ITEMS.length} items</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFrequent(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={16} color={colors.teal} />
                </View>
              </TouchableOpacity>
            </View>

            {/* 4-column grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.freqGrid}
            >
              {FREQUENT_ITEMS.map((item) => (
                <FrequentItemCard
                  key={item.id}
                  item={item}
                  onAdd={() => handleQuickAdd(item)}
                  loading={loading}
                />
              ))}
            </ScrollView>

          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  toastSub:   { color: "rgba(255,255,255,0.55)", fontSize: typography.xs, marginTop: 2 },

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
    color: "#000000",
    letterSpacing: typography.wide,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900" as const,
    color: colors.teal,
    marginBottom: spacing.md,
    lineHeight: 26,
  },
  statBoxRow: { flexDirection: "row", gap: spacing.sm },
  statBox: { flex: 1, borderRadius: radius.md, overflow: "hidden" },
  statBoxGradient: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 64,
  },
  statBoxValue: {
    fontSize: 26,
    fontWeight: "900" as const,
    color: colors.white,
    lineHeight: 30,
  },
  statBoxLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ── Frequent Banner ───────────────────────────────────────
  frequentBannerWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    ...shadows.card,
  },
  frequentBanner: { height: 155, flexDirection: "row" },
  bannerContent: { flex: 1, padding: spacing.lg, justifyContent: "flex-start" },
  frequentTitle: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 19,
    lineHeight: 22,
    marginBottom: 1,
  },
  frequentSub: {
    color: "#008296",
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 21,
  },
  viewBtnRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: "auto" },
  viewBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  viewBtnText: { color: colors.white, fontWeight: typography.bold, fontSize: typography.sm },
  viewBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Categories ────────────────────────────────────────────
  categoriesCard: {
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.white, fontWeight: typography.bold, fontSize: typography.lg },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { color: "rgba(255,255,255,0.85)", fontSize: typography.sm, fontWeight: "800" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryCardWrapper: { width: "23%", borderRadius: radius.lg, overflow: "hidden", ...shadows.card },
  categorySelectedWrapper: { opacity: 1 },
  categoryTopImage: { width: "100%", height: CARD_SIZE * 1.45, position: "relative" },
  categoryOverlay: { ...StyleSheet.absoluteFillObject },
  categoryCheckmark: {
    position: "absolute", top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  categoryName: { color: colors.white, fontWeight: "900", fontSize: 11, textAlign: "center" },
  categoryGradient: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
    justifyContent: "flex-end", alignItems: "center", flexDirection: "column", paddingBottom: 8,
  },
  categorySelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.teal,
    borderRadius: radius.lg,
  },

  // ── Build Your List ───────────────────────────────────────
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
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
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
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
    backgroundColor: "rgba(198,231,236,0.75)",
    borderColor: "rgba(198,231,236,0.8)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 46,
    borderWidth: 1,
  },
  inputRowError: { borderWidth: 1.5, borderColor: "#E74C3C" },
  inputError: { color: "#FFB3A7", fontSize: typography.xs, marginBottom: spacing.md, marginLeft: 4 },
  input: { flex: 1, height: 46, color: "#006070", fontSize: typography.base },
  totalPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  totalPreviewText: { color: "rgba(255,255,255,0.75)", fontSize: typography.sm, fontWeight: typography.medium },
  totalPreviewAmount: { color: colors.white, fontWeight: typography.bold, fontSize: typography.sm },
  priorityRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  priorityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  priorityDot: { width: 7, height: 7, borderRadius: 3.5 },
  priorityBtnText: { color: "rgba(255,255,255,0.65)", fontSize: typography.sm, fontWeight: typography.medium },
  selectedCatRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    marginBottom: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.md, backgroundColor: "rgba(255,255,255,0.06)",
  },
  selectedCatRowActive: { backgroundColor: "rgba(46,204,113,0.1)" },
  selectedCatText: { color: "rgba(255,255,255,0.45)", fontSize: typography.xs, fontWeight: typography.medium, flex: 1 },
  addBtn: { borderRadius: radius.md, overflow: "hidden" },
  addBtnDisabled: { opacity: 0.55 },
  addBtnGradient: { paddingVertical: spacing.md + 2, alignItems: "center", flexDirection: "row", justifyContent: "center" },
  addBtnText: { color: colors.white, fontWeight: typography.extrabold, fontSize: typography.lg },

  // ── Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: MODAL_BOTTOM_PADDING,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.extrabold,
    color: colors.teal,
  },
  modalSub: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Freq grid ─────────────────────────────────────────────
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
});