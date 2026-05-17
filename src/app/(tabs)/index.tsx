import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, shadows, typography } from "../../constants/theme";
import { useGroceryStore } from "@/store/grocery-store";

// ─── Local item images ─────────────────────────────────────────────────────────
const ITEM_IMAGES: Record<string, any> = {
  adobo:      require("@/assets/images/items/adobo.jpg"),
  apple:      require("@/assets/images/items/apple.jpg"),
  applecider: require("@/assets/images/items/applecider.jpg"),
  banana:     require("@/assets/images/items/banana.jpg"),
  barley:     require("@/assets/images/items/barley.jpg"),
  bread:      require("@/assets/images/items/bread.jpg"),
  butter:     require("@/assets/images/items/butter.jpg"),
  cabbage:    require("@/assets/images/items/cabbage.jpg"),
  carrot:     require("@/assets/images/items/carrot.jpg"),
  cheese:     require("@/assets/images/items/cheese.jpg"),
  chicken:    require("@/assets/images/items/chicken.jpg"),
  chips:      require("@/assets/images/items/chips.jpg"),
  chocolate:  require("@/assets/images/items/chocolate.jpg"),
  coke:       require("@/assets/images/items/coke.jpg"),
  cornflakes: require("@/assets/images/items/cornflakes.jpg"),
  eggplant:   require("@/assets/images/items/eggplant.jpg"),
  fish:       require("@/assets/images/items/fish.jpg"),
  grapes:     require("@/assets/images/items/grapes.jpg"),
  icecream:   require("@/assets/images/items/icecream.jpg"),
  lobster:    require("@/assets/images/items/lobster.jpg"),
  mango:      require("@/assets/images/items/mango.jpg"),
  milk:       require("@/assets/images/items/milk.jpg"),
  oat:        require("@/assets/images/items/oat.jpg"),
  oil:        require("@/assets/images/items/oil.jpg"),
  okra:       require("@/assets/images/items/okra.jpg"),
  orange:     require("@/assets/images/items/orange.jpg"),
  oyster:     require("@/assets/images/items/oyster.jpg"),
  popcorn:    require("@/assets/images/items/popcorn.jpg"),
  porkchop:   require("@/assets/images/items/porkchop.jpg"),
  rice:       require("@/assets/images/items/rice.jpg"),
  salmon:     require("@/assets/images/items/salmon.jpg"),
  salt:       require("@/assets/images/items/salt.jpg"),
  shrimp:     require("@/assets/images/items/shrimp.jpg"),
  sinigang:   require("@/assets/images/items/sinigang.jpg"),
  squash:     require("@/assets/images/items/squash.jpg"),
  steak:      require("@/assets/images/items/steak.jpg"),
  sugar:      require("@/assets/images/items/sugar.jpg"),
  vinegar:    require("@/assets/images/items/vinegar.jpg"),
  wheat:      require("@/assets/images/items/wheat.jpg"),
  yogurt:     require("@/assets/images/items/yogurt.jpg"),
};

const getItemImage = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, "");
  return ITEM_IMAGES[key] ?? null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "#C0392B", bg: "#FDECEA" },
  medium: { label: "Medium", color: "#B7770D", bg: "#FEF9E7" },
  low:    { label: "Low",    color: "#1E8449", bg: "#EAFAF1" },
};

const fmt = (v: number) =>
  `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListScreen() {
  const { items, togglePurchased, updateQuantity, removeItem, clearPurchased } =
    useGroceryStore();

  const pending   = items.filter((i) => !i.purchased);
  const completed = items.filter((i) => i.purchased);
  const pct       = items.length > 0 ? Math.round((completed.length / items.length) * 100) : 0;

  const completedCost     = completed.reduce((s, i) => s + (i.totalPrice ?? (i.estimatedPrice != null ? i.estimatedPrice * i.quantity : 0)), 0);
  const hasCompletedPrice = completed.some((i) => i.estimatedPrice != null);

  const handleClear = () =>
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear",  style: "destructive", onPress: () => clearPurchased() },
    ]);

  return (
    <LinearGradient
      colors={["#7BC9BE", "#008296"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >

          {/* ── HERO CARD ─────────────────────────── */}
          <View style={styles.heroCard}>
            <Text style={styles.todayLabel}>TODAY</Text>
            <Text style={styles.heroTitle}>Your Grocery Board</Text>

            <View style={styles.statRow}>
              <View style={styles.statChip}>
                <View style={[styles.statDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.statChipText}>{pending.length} pending</Text>
              </View>
              <View style={styles.statChip}>
                <View style={[styles.statDot, { backgroundColor: "#2ECC71" }]} />
                <Text style={styles.statChipText}>{completed.length} completed</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
              </View>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
          </View>

          {/* ── SHOPPING ITEMS ───────────────────── */}
          {pending.length > 0 && (
            <View style={styles.outerSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>SHOPPING ITEMS</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{pending.length}</Text>
                </View>
              </View>

              <View style={styles.innerSection}>
                {pending.map((item) => {
                  const catPill  = CATEGORY_PILL[item.category]  ?? { bg: "#F0F0F0", color: "#555" };
                  const pCfg     = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.low;
                  const lineTotal = item.estimatedPrice != null
                    ? (item.totalPrice ?? item.estimatedPrice * item.quantity)
                    : null;
                  const itemImage = getItemImage(item.name);

                  return (
                    <View key={item.id} style={styles.itemCard}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => togglePurchased(item.id)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: false }}
                      />

                      {itemImage ? (
                        <Image
                          source={itemImage}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbnailPlaceholder}>
                          <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.4)" />
                        </View>
                      )}

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.catPill, { backgroundColor: catPill.bg }]}>
                          <Text style={[styles.catPillText, { color: catPill.color }]}>
                            {item.category}
                          </Text>
                        </View>
                        {lineTotal !== null && (
                          <Text style={styles.itemPrice}>{fmt(lineTotal)}</Text>
                        )}
                      </View>

                      <View style={styles.itemRight}>
                        <View style={styles.itemRightTop}>
                          <View style={[styles.priBadge, { backgroundColor: pCfg.bg }]}>
                            <Text style={[styles.priBadgeText, { color: pCfg.color }]}>
                              {pCfg.label}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => removeItem(item.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.trashBtn}
                          >
                            <Ionicons name="trash-outline" size={13} color="#FF4444" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.qtyRow}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="remove" size={14} color="#007A8A" />
                          </TouchableOpacity>
                          <View style={styles.qtyTrack}>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="add" size={14} color="#007A8A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── EMPTY STATE ──────────────────────── */}
          {pending.length === 0 && completed.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Text style={{ fontSize: 38 }}>🛒</Text>
              </View>
              <Text style={styles.emptyTitle}>Your list is empty!</Text>
              <Text style={styles.emptySub}>
                Head over to the Planner tab to add items to your grocery list.
              </Text>
            </View>
          )}

          {/* ── ALL DONE ─────────────────────────── */}
          {pending.length === 0 && completed.length > 0 && (
            <View style={styles.allDoneCard}>
              <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>🎉</Text>
              <Text style={styles.allDoneTitle}>All done!</Text>
              <Text style={styles.allDoneSub}>You've checked off everything on your list.</Text>
            </View>
          )}

          {/* ── DIVIDER ──────────────────────────── */}
          {pending.length > 0 && completed.length > 0 && (
            <View style={styles.divider} />
          )}

          {/* ── COMPLETED ────────────────────────── */}
          {completed.length > 0 && (
            <View style={styles.outerSection}>
              <View style={styles.innerSection}>
                <View style={styles.completedCard}>
                  <View style={styles.completedHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Ionicons name="checkmark-circle" size={14} color="#2ECC71" />
                      <Text style={styles.completedHeaderLabel}>
                        COMPLETED · {completed.length}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleClear}
                      style={styles.clearAllBtn}
                    >
                      <Ionicons name="trash-outline" size={13} color="#FF6B6B" />
                      <Text style={styles.clearText}>Clear all</Text>
                    </TouchableOpacity>
                  </View>

                  {completed.map((item, index) => {
                    const lineTotal = item.estimatedPrice != null
                      ? (item.totalPrice ?? item.estimatedPrice * item.quantity)
                      : null;
                    const isLast    = index === completed.length - 1;
                    const itemImage = getItemImage(item.name);

                    return (
                      <View
                        key={item.id}
                        style={[styles.completedItem, !isLast && styles.completedItemBorder]}
                      >
                        <TouchableOpacity
                          onPress={() => togglePurchased(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <View style={styles.completedCheck}>
                            <Ionicons name="checkmark" size={11} color="#2ECC71" />
                          </View>
                        </TouchableOpacity>

                        {itemImage ? (
                          <Image
                            source={itemImage}
                            style={styles.completedThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.completedThumbPlaceholder}>
                            <Ionicons name="image-outline" size={11} color="rgba(255,255,255,0.3)" />
                          </View>
                        )}

                        <Text style={styles.completedName} numberOfLines={1}>
                          {item.name}
                        </Text>

                        {lineTotal !== null && (
                          <Text style={styles.completedPrice}>{fmt(lineTotal)}</Text>
                        )}

                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.trashBtn}
                        >
                          <Ionicons name="trash-outline" size={13} color="#FF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {hasCompletedPrice && (
                    <View style={styles.spentRow}>
                      <Text style={styles.spentLabel}>Spent</Text>
                      <Text style={styles.spentValue}>{fmt(completedCost)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero Card ──────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...shadows.card,
  },
  todayLabel: {
    fontSize: typography.xs,
    color: "#007A8A",
    letterSpacing: typography.wide,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.sm,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#B2E0DC",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007A8A",
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "right",
  },

  // ── Section headers ────────────────────────────────────────────────────────
  outerSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    letterSpacing: typography.wide,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: { color: colors.white, fontSize: 11, fontWeight: typography.bold },
  innerSection: { marginHorizontal: spacing.sm },

  // ── Pending item cards ─────────────────────────────────────────────────────
  itemCard: {
    backgroundColor: "rgba(0,110,130,0.50)",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    flexShrink: 0,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0, gap: 3, paddingRight: 4 },
  itemName: {
    fontWeight: "800",
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.1,
  },
  catPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  catPillText: { fontSize: 9, fontWeight: typography.semibold },
  itemPrice: {
    fontSize: 13,
    color: colors.white,
    fontWeight: "700",
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
    flexShrink: 0,
    paddingVertical: 2,
  },
  itemRightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  priBadgeText: { fontSize: 9, fontWeight: typography.bold },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyTrack: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 28,
    alignItems: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
  },

  // ── Divider — slightly thicker ─────────────────────────────────────────────
  divider: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: spacing.lg + spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    borderRadius: 1,
  },

  // ── Action buttons ─────────────────────────────────────────────────────────
  trashBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "rgba(255,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,107,107,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // ── Completed card ─────────────────────────────────────────────────────────
  completedCard: {
    backgroundColor: "rgba(0,110,130,0.50)",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  completedHeaderLabel: {
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    letterSpacing: typography.wide,
    color: "rgba(255,255,255,0.85)",
  },
  clearText: { fontSize: typography.sm, color: "#FF6B6B", fontWeight: typography.semibold },
  completedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: "rgba(46,204,113,0.06)",
  },
  completedItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  completedCheck: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "rgba(46,204,113,0.25)",
    borderWidth: 1.5,
    borderColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
  },
  completedThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  completedThumbPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  completedName: {
    flex: 1,
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.45)",
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  completedPrice: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: typography.medium,
    textDecorationLine: "line-through",
  },
  spentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  spentLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  spentValue: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "800",
  },

  // ── Empty / All done states ────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  allDoneCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: "rgba(0,70,90,0.40)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  allDoneTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  allDoneSub: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});