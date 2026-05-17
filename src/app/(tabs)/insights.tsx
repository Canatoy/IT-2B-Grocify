import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useUser } from "@clerk/expo";
import { colors, radius, spacing, shadows, typography } from "../../constants/theme";
import { useGroceryStore } from "@/store/grocery-store";

// ─── Constants ────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  `₱${v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const now = new Date();
const MONTH_LABEL = now.toLocaleString("en-PH", { month: "long" }).toUpperCase();
const YEAR_LABEL  = now.getFullYear();

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyBars({ items }: { items: ReturnType<typeof useGroceryStore>["items"] }) {
  const weeklyTotals = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    for (const item of items) {
      if (!item.purchased) continue;
      const val =
        item.totalPrice ??
        (item.estimatedPrice != null ? item.estimatedPrice * item.quantity : 0);
      // Distribute by a hash of the item id so it's stable & spread across weeks
      const weekIndex =
        Math.abs(
          item.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
        ) % 4;
      weeks[weekIndex] += val;
    }
    return weeks;
  }, [items]);

  const maxVal   = Math.max(...weeklyTotals, 1);
  const BAR_MAX_H = 68;

  return (
    <View style={barStyles.container}>
      {weeklyTotals.map((val, i) => {
        const barH = Math.max((val / maxVal) * BAR_MAX_H, val > 0 ? 10 : 4);
        return (
          <View key={i} style={barStyles.barCol}>
            <View style={barStyles.barTrack}>
              <View
                style={[
                  barStyles.bar,
                  { height: barH, opacity: val > 0 ? 1 : 0.22 },
                ]}
              />
            </View>
            <Text style={barStyles.barLabel}>Week {i + 1}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 90,
    paddingTop: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  barTrack: {
    width: "72%",
    height: 68,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: "#00FF85",
    borderRadius: 4,
    shadowColor: "#00FF85",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  barLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    textAlign: "center",
  },
});

// ─── Pie Chart (pure RN, no library) ─────────────────────────────────────────
// Renders filled wedge slices using clipped rotated rectangles.

type PieSlice = { color: string; value: number };

function PieChart({ slices, size = 120 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const half  = size / 2;

  let cumulativeDeg = -90; // start from top

  const wedges: React.ReactNode[] = [];

  slices.forEach((sl, idx) => {
    const fraction = sl.value / total;
    const deg      = fraction * 360;
    if (deg <= 0) return;

    // We split any slice > 180° into two ≤ 180° halves
    const parts = deg > 180
      ? [{ start: cumulativeDeg, sweep: 180 }, { start: cumulativeDeg + 180, sweep: deg - 180 }]
      : [{ start: cumulativeDeg, sweep: deg }];

    parts.forEach((part, partIdx) => {
      wedges.push(
        <View
          key={`${idx}-${partIdx}`}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: half,
            overflow: "hidden",
          }}
        >
          {/* Rotate the whole container to align the wedge start */}
          <View
            style={{
              position: "absolute",
              width: size,
              height: size,
              transform: [{ rotate: `${part.start}deg` }],
            }}
          >
            {/* Right half-rectangle, rotated by sweep angle */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: half,
                width: half,
                height: size,
                backgroundColor: sl.color,
                transformOrigin: "left center",
                transform: [{ rotate: `${part.sweep}deg` }],
              }}
            />
          </View>
        </View>
      );
    });

    cumulativeDeg += deg;
  });

  return (
    <View style={{ width: size, height: size }}>
      {/* Base background */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: "rgba(0,60,80,0.4)",
        }}
      />
      {wedges}
      {/* Centre hole (donut effect) */}
      <View
        style={{
          position: "absolute",
          width: size * 0.40,
          height: size * 0.40,
          borderRadius: size * 0.20,
          backgroundColor: "rgba(0,90,110,0.75)",
          top: size * 0.30,
          left: size * 0.30,
        }}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const { signOut }           = useAuth();
  const { user }              = useUser();
  const { items, clearPurchased } = useGroceryStore();

  const stats = useMemo(() => {
    const purchased = items.filter((i) => i.purchased);
    const pending   = items.filter((i) => !i.purchased);

    const weeklySpending = purchased.reduce(
      (s, i) =>
        s + (i.totalPrice ?? (i.estimatedPrice != null ? i.estimatedPrice * i.quantity : 0)),
      0
    );

    const monthlyTotal = items.reduce(
      (s, i) => s + (i.estimatedPrice != null ? i.estimatedPrice * i.quantity : 0),
      0
    );

    // Top purchased items by total quantity bought
    const freq: Record<string, number> = {};
    for (const item of purchased) {
      freq[item.name] = (freq[item.name] ?? 0) + item.quantity;
    }
    const topItems = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({ name, qty }));

    return {
      weeklySpending,
      monthlyTotal,
      topItems,
      totalItems:     items.length,
      completedItems: purchased.length,
      remainingItems: pending.length,
    };
  }, [items]);

  const handleLogout = () =>
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => signOut() },
    ]);

  const handleEdit = () =>
    Alert.alert("Edit Profile", "Profile editing coming soon.");

  const handleClearCompleted = () =>
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => clearPurchased() },
    ]);

  const displayName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user?.username ?? "Username";

  const pieSlices: (PieSlice & { label: string })[] = [
    { color: "#B0AEEE", value: stats.totalItems,     label: "Total Items"     },
    { color: "#1A3A6B", value: stats.completedItems, label: "Completed Items" },
    { color: "#7BBFDB", value: stats.remainingItems, label: "Remaining Items" },
  ];

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

          {/* ── PROFILE CARD ──────────────────────── */}
          <View style={styles.card}>
            <View style={styles.profileRow}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={28} color={colors.teal} />
                </View>
              )}
              <Text style={styles.username}>{displayName}</Text>
            </View>
            <View style={styles.profileBtnRow}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={handleEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.profileBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.profileBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── SPENDING ROW ──────────────────────── */}
          <View style={styles.spendingRow}>

            {/* Left — weekly + bar chart */}
            <View style={[styles.card, styles.spendingLeft]}>
              <Text style={styles.spendingLabel}>Weekly spending</Text>
              <Text style={styles.spendingValue}>{fmt(stats.weeklySpending)}</Text>
              <WeeklyBars items={items} />
            </View>

            {/* Right — month + monthly total */}
            <View style={[styles.card, styles.spendingRight]}>
              <Text style={styles.monthName}>{MONTH_LABEL}</Text>
              <Text style={styles.monthYear}>{YEAR_LABEL}</Text>
              <Text style={styles.monthlyLabel}>Monthly total spending</Text>
              <Text style={styles.monthlyValue}>{fmt(stats.monthlyTotal)}</Text>
            </View>

          </View>

          {/* ── TOP PURCHASED ITEMS ───────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Purchased Items</Text>

            {stats.topItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="bag-outline" size={30} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>
                  No purchased items yet.{"\n"}Complete some items from your list!
                </Text>
              </View>
            ) : (
              <View style={styles.topGrid}>
                {stats.topItems.map((item, idx) => {
                  const img = getItemImage(item.name);
                  return (
                    <View key={idx} style={styles.topItemCard}>
                      {img ? (
                        <Image
                          source={img}
                          style={styles.topItemImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.topItemImgPlaceholder}>
                          <Ionicons
                            name="image-outline"
                            size={14}
                            color="rgba(255,255,255,0.35)"
                          />
                        </View>
                      )}
                      <Text style={styles.topItemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── STOCK LEVEL OVERVIEW ──────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Stock Level Overview</Text>

            <View style={styles.stockRow}>
              <PieChart slices={pieSlices} size={120} />

              <View style={styles.legendCol}>
                {pieSlices.map((sl, i) => (
                  <View key={i} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: sl.color }]} />
                    <Text style={styles.legendLabel}>{sl.label}:</Text>
                    <Text style={styles.legendCount}>{sl.value}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearCompleted}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={11} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.clearBtnText}>Clear completed items</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── FEEDBACK ──────────────────────────── */}
          <TouchableOpacity
            style={styles.feedbackBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert("Feedback", "Thank you! Feedback feature coming soon.")
            }
          >
            <Ionicons name="chatbox-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.feedbackText}>Feedback</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Shared card ───────────────────────────────────────────
  card: {
    backgroundColor: "rgba(0,110,130,0.50)",
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
  },

  // ── Profile ───────────────────────────────────────────────
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  avatarPlaceholder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  username: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    flex: 1,
  },
  profileBtnRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  profileBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
  },
  profileBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: typography.sm,
  },

  // ── Spending row ──────────────────────────────────────────
  spendingRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  spendingLeft: {
    flex: 1.3,
    marginHorizontal: 0,
    marginTop: 0,
    padding: spacing.md,
  },
  spendingRight: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    padding: spacing.md,
    justifyContent: "center",
  },
  spendingLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  spendingValue: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.3,
  },
  monthName: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.5,
  },
  monthYear: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    marginBottom: spacing.sm,
  },
  monthlyLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  monthlyValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.3,
  },

  // ── Section title ─────────────────────────────────────────
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    marginBottom: spacing.md,
  },

  // ── Top Items ─────────────────────────────────────────────
  topGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  topItemCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,130,150,0.55)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  topItemImg: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  topItemImgPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  topItemName: {
    flex: 1,
    color: colors.white,
    fontWeight: "700",
    fontSize: typography.sm,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: typography.sm,
    textAlign: "center",
    lineHeight: 19,
  },

  // ── Stock Level ───────────────────────────────────────────
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  legendCol: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    flex: 1,
  },
  legendCount: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "800",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  clearBtnText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  // ── Feedback ──────────────────────────────────────────────
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    ...shadows.card,
  },
  feedbackText: {
    fontSize: typography.base,
    fontWeight: "800",
    color: colors.textPrimary,
  },
});