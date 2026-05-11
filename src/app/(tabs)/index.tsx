import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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
  priorityColors,
} from "../../constants/theme";
import { useGroceryStore } from "@/store/grocery-store";

const CATEGORY_EMOJI: Record<string, string> = {
  Fruits: "🍎", Vegetables: "🥦", Dairy: "🧀", Snacks: "🍿",
  Pantry: "🥫", Grain: "🍞", Meat: "🥩", Seafood: "🐟",
};

const CATEGORY_BG: Record<string, [string, string]> = {
  Fruits:     ["#FFE0D0", "#FFB899"],
  Vegetables: ["#D8F0DA", "#A8DAB0"],
  Dairy:      ["#D3EAFD", "#A1CEFC"],
  Snacks:     ["#FFF4CC", "#FFE082"],
  Pantry:     ["#EDD9F5", "#D5A8F0"],
  Grain:      ["#EDE0D4", "#D5B99A"],
  Meat:       ["#FCE4EC", "#F48FB1"],
  Seafood:    ["#E0F7FA", "#80DEEA"],
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "#FF5252",
  medium: "#FFB300",
  low:    "#69F0AE",
};

export default function ListScreen() {
  const { items, togglePurchased, updateQuantity, removeItem, clearPurchased } = useGroceryStore();

  const pending   = items.filter((i) => !i.purchased);
  const completed = items.filter((i) => i.purchased);
  const progress  = items.length > 0 ? completed.length / items.length : 0;
  const pct       = Math.round(progress * 100);

  const handleClearCompleted = () =>
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => clearPurchased() },
    ]);

  return (
    <LinearGradient colors={["#7BC9BE", "#008296"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* ── Hero Card ─────────────────────────── */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Text style={styles.todayLabel}>TODAY</Text>
              {items.length > 0 && (
                <View style={styles.pctPill}>
                  <Text style={styles.pctText}>{pct}% done</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroTitle}>Your Grocery Board</Text>

            <View style={styles.statChipRow}>
              <View style={styles.statChip}>
                <Ionicons name="cart-outline" size={13} color={colors.teal} />
                <Text style={styles.statChipText}>{pending.length} pending</Text>
              </View>
              <View style={[styles.statChip, { marginLeft: spacing.sm }]}>
                <Ionicons name="checkmark-circle-outline" size={13} color="#2ECC71" />
                <Text style={styles.statChipText}>{completed.length} completed</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#62C4BC", "#006A7A"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            </View>
          </View>

          {/* ── Shopping Items ───────────────────── */}
          {pending.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>SHOPPING ITEMS</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{pending.length}</Text>
                </View>
              </View>

              {pending.map((item) => {
                const emoji         = CATEGORY_EMOJI[item.category] ?? "🛒";
                const catBg         = CATEGORY_BG[item.category] ?? ["#F0F0F0", "#DDD"];
                const dotColor      = PRIORITY_COLOR[item.priority] ?? "#ccc";
                const priorityLabel = item.priority.charAt(0).toUpperCase() + item.priority.slice(1);

                return (
                  <View key={item.id} style={styles.itemCard}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => togglePurchased(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    />

                    {/* Emoji thumbnail */}
                    <LinearGradient
                      colors={catBg as [string, string]}
                      style={styles.thumbnail}
                    >
                      <Text style={styles.thumbnailEmoji}>{emoji}</Text>
                    </LinearGradient>

                    {/* Info */}
                    <View style={styles.itemInfo}>
                      {/* Row 1: name + priority badge + delete */}
                      <View style={styles.itemTopRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.itemTopActions}>
                          <View style={[styles.priorityBadge, { backgroundColor: dotColor + "22", borderColor: dotColor }]}>
                            <Text style={[styles.priorityBadgeText, { color: dotColor }]}>
                              {priorityLabel}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => removeItem(item.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.6)" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Row 2: category pill */}
                      <View style={styles.metaRow}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>{item.category}</Text>
                        </View>
                      </View>

                      {/* Row 3: qty controls */}
                      <View style={styles.qtyRow}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="remove" size={14} color={colors.white} />
                        </TouchableOpacity>
                        <View style={styles.qtyPill}>
                          <Text style={styles.qtyText}>{item.quantity}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="add" size={14} color={colors.white} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Empty State ──────────────────────── */}
          {pending.length === 0 && completed.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>🛒</Text>
              </View>
              <Text style={styles.emptyTitle}>Your list is empty!</Text>
              <Text style={styles.emptySubtext}>Head over to Planner to add items to your grocery list.</Text>
            </View>
          )}

          {/* ── All Done State ───────────────────── */}
          {pending.length === 0 && completed.length > 0 && (
            <View style={styles.allDoneCard}>
              <Text style={styles.allDoneEmoji}>🎉</Text>
              <Text style={styles.allDoneTitle}>All done!</Text>
              <Text style={styles.allDoneSub}>You've checked off everything on your list.</Text>
            </View>
          )}

          {/* ── Divider ──────────────────────────── */}
          {pending.length > 0 && completed.length > 0 && (
            <View style={styles.divider} />
          )}

          {/* ── Completed ────────────────────────── */}
          {completed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.completedCard}>
                <View style={styles.completedHeader}>
                  <View style={styles.completedLabelRow}>
                    <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.completedLabel}>COMPLETED  ·  {completed.length}</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearCompleted} style={styles.clearBtn}>
                    <Ionicons name="trash-outline" size={13} color="#FF6B6B" />
                    <Text style={styles.clearText}>Clear all</Text>
                  </TouchableOpacity>
                </View>

                {completed.map((item) => (
                  <View key={item.id} style={styles.completedItem}>
                    <TouchableOpacity
                      onPress={() => togglePurchased(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <View style={styles.completedCheck}>
                        <Ionicons name="checkmark" size={13} color={colors.white} />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.completedEmoji}>{CATEGORY_EMOJI[item.category] ?? "🛒"}</Text>
                    <Text style={styles.completedName} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero Card ─────────────────────────────────────────────
  heroCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
    overflow: "hidden",
    ...shadows.card,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  todayLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    fontWeight: typography.semibold,
    textTransform: "uppercase",
  },
  pctPill: {
    backgroundColor: "#E8F8F5",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pctText: {
    fontSize: 11,
    fontWeight: typography.bold,
    color: "#008296",
  },
  heroTitle: {
    fontSize: typography.xxl,
    fontWeight: "900" as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statChipRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F4FAFA",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#D0ECEC",
  },
  statChipText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#EEEEEE",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  // ── Section ───────────────────────────────────────────────
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
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
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: typography.bold,
  },

  // ── Item Card ─────────────────────────────────────────────
  itemCard: {
    backgroundColor: "rgba(0, 130, 150, 0.48)",
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#FFFFFF",                     // white stroke — matches Figma
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    flexShrink: 0,
  },
  thumbnail: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  thumbnailEmoji: { fontSize: 28 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    fontWeight: "800" as const,
    fontSize: typography.base,
    color: colors.white,
    flex: 1,
    marginRight: spacing.xs,
  },
  itemTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: typography.bold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryPillText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    fontWeight: typography.semibold,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  qtyPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: radius.pill,
    minWidth: 32,
    alignItems: "center",
  },
  qtyText: {
    fontWeight: typography.bold,
    fontSize: typography.base,
    color: colors.white,
  },

  // ── Divider ───────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: spacing.xxxl },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyIcon: { fontSize: 38 },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── All Done ──────────────────────────────────────────────
  allDoneCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "rgba(0,80,96,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  allDoneEmoji: { fontSize: 40, marginBottom: spacing.sm },
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

  // ── Completed ─────────────────────────────────────────────
  completedCard: {
    backgroundColor: "rgba(0, 130, 150, 0.48)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  completedLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  completedLabel: {
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    letterSpacing: typography.wide,
    color: "rgba(255,255,255,0.8)",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearText: {
    fontSize: typography.sm,
    color: "#FF6B6B",
    fontWeight: typography.semibold,
  },
  completedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    gap: spacing.sm,
  },
  completedCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  completedEmoji: { fontSize: 16 },
  completedName: {
    flex: 1,
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.55)",
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
});