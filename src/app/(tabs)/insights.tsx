import { useGroceryStore } from "@/store/grocery-store";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing, typography } from "../../constants/theme";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;

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

const now         = new Date();
const MONTH_LABEL = now.toLocaleString("en-PH", { month: "long" }).toUpperCase();
const YEAR_LABEL  = now.getFullYear();

// ─── Helper: resolve which week of the month a date falls in ─────────────────
//
//  Day 1–7   → W1 (index 0)
//  Day 8–14  → W2 (index 1)
//  Day 15–21 → W3 (index 2)
//  Day 22+   → W4 (index 3)
//
function getWeekIndex(date: Date): number {
  const day = date.getDate();
  if (day <= 7)  return 0;
  if (day <= 14) return 1;
  if (day <= 21) return 2;
  return 3;
}

// ─── Helper: parse item creation date from item.id or item.createdAt ─────────
//
// Zustand stores typically use Date.now().toString() as an id, e.g. "1716000000000".
// If the store adds a createdAt field instead, that is preferred.
//
function resolveItemDate(item: any): Date {
  // 1. Explicit createdAt field
  if (item.createdAt) return new Date(item.createdAt);

  // 2. Numeric-looking id that looks like a ms timestamp (13 digits)
  const ts = Number(item.id);
  if (!isNaN(ts) && item.id.length >= 12) return new Date(ts);

  // 3. Default to right now (item placed in current week)
  return new Date();
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyBars({
  items,
}: {
  items: ReturnType<typeof useGroceryStore>["items"];
}) {
  const weeklyTotals = useMemo(() => {
    const weeks        = [0, 0, 0, 0];
    const currentMonth = now.getMonth();
    const currentYear  = now.getFullYear();

    for (const item of items) {
      if (!item.purchased) continue;

      const val =
        item.totalPrice ??
        (item.estimatedPrice != null ? item.estimatedPrice * item.quantity : 0);

      if (val <= 0) continue;

      const itemDate = resolveItemDate(item);

      // Only bucket items from the current month/year
      if (
        itemDate.getMonth()    !== currentMonth ||
        itemDate.getFullYear() !== currentYear
      ) continue;

      weeks[getWeekIndex(itemDate)] += val;
    }

    return weeks;
  }, [items]);

  const maxVal    = Math.max(...weeklyTotals, 1);
  const BAR_MAX_H = 56;

  return (
    <View style={barStyles.container}>
      {weeklyTotals.map((val, i) => {
        const barH   = Math.max((val / maxVal) * BAR_MAX_H, val > 0 ? 10 : 3);
        const active = val > 0;
        return (
          <View key={i} style={barStyles.barCol}>
            {active && (
              <Text style={barStyles.barValue}>
                {val >= 1000 ? `₱${(val / 1000).toFixed(1)}k` : `₱${Math.round(val)}`}
              </Text>
            )}
            <View style={barStyles.barTrack}>
              <LinearGradient
                colors={
                  active
                    ? ["#00FF85", "#00D4A8"]
                    : ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.08)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[barStyles.bar, { height: barH }]}
              />
            </View>
            <Text style={barStyles.barLabel}>W{i + 1}</Text>
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
    height: 80,
    paddingTop: spacing.xs,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  barValue: {
    fontSize: 7,
    color: "#00FF85",
    fontWeight: "800",
    marginBottom: 2,
  },
  barTrack: {
    width: "85%",
    height: 56,
    justifyContent: "flex-end",
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 5,
  },
  barLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },
});

// ─── Donut Chart (pure RN) ────────────────────────────────────────────────────

type PieSlice = { color: string; value: number; label: string };

function DonutChart({ slices, size = 110 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const half  = size / 2;
  let cumulativeDeg = -90;
  const wedges: React.ReactNode[] = [];

  slices.forEach((sl, idx) => {
    const deg = (sl.value / total) * 360;
    if (deg <= 0) return;

    const parts =
      deg > 180
        ? [
            { start: cumulativeDeg, sweep: 180 },
            { start: cumulativeDeg + 180, sweep: deg - 180 },
          ]
        : [{ start: cumulativeDeg, sweep: deg }];

    parts.forEach((part, pi) => {
      wedges.push(
        <View
          key={`${idx}-${pi}`}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: half,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: size,
              height: size,
              transform: [{ rotate: `${part.start}deg` }],
            }}
          >
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

  const pct = total > 0 ? Math.round((slices[1]?.value / total) * 100) : 0;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: "rgba(0,50,70,0.5)",
        }}
      />
      {wedges}
      <View
        style={{
          position: "absolute",
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: size * 0.23,
          backgroundColor: "rgba(0,80,100,0.85)",
          top: size * 0.27,
          left: size * 0.27,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.white, fontSize: 13, fontWeight: "900" }}>
          {pct}%
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 7, fontWeight: "700" }}>
          DONE
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const { signOut }               = useAuth();
  const { user }                  = useUser();

  // ── Read displayName from store so edits in ProfileScreen reflect here ──
  const { items, clearPurchased, displayName: storeDisplayName } = useGroceryStore();

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

    const freq: Record<string, number> = {};
    for (const item of purchased) {
      freq[item.name] = (freq[item.name] ?? 0) + item.quantity;
    }
    const topItems = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({ name, qty }));

    const maxQty = topItems[0]?.qty ?? 1;

    return {
      weeklySpending,
      monthlyTotal,
      topItems,
      maxQty,
      totalItems:     items.length,
      completedItems: purchased.length,
      remainingItems: pending.length,
    };
  }, [items]);

  const handleClearCompleted = () =>
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => clearPurchased() },
    ]);

  // ── Prefer storeDisplayName set by ProfileScreen, fall back to Clerk ──
  const displayName =
    storeDisplayName ||
    (user?.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user?.username ?? "Username");

  const pieSlices: PieSlice[] = [
    { color: "#B0AEEE", value: stats.totalItems,     label: "Total Items" },
    { color: "#2ECC71", value: stats.completedItems, label: "Completed"   },
    { color: "#7BBFDB", value: stats.remainingItems, label: "Remaining"   },
  ];

  const completionPct =
    stats.totalItems > 0
      ? Math.round((stats.completedItems / stats.totalItems) * 100)
      : 0;

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

          {/* ── HERO CARD ────────────────────────────────────── */}
          <View style={styles.heroCard}>
            <View style={styles.profileRow}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={26} color={colors.teal} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingLabel}>WELCOME BACK</Text>
                <Text style={styles.username} numberOfLines={1}>{displayName}</Text>
              </View>
            </View>

            <View style={styles.heroStatRow}>
              <View style={styles.heroStatChip}>
                <View style={[styles.heroStatDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.heroStatText}>{stats.remainingItems} pending</Text>
              </View>
              <View style={styles.heroStatChip}>
                <View style={[styles.heroStatDot, { backgroundColor: "#2ECC71" }]} />
                <Text style={styles.heroStatText}>{stats.completedItems} done</Text>
              </View>
              <View style={styles.heroStatChip}>
                <View style={[styles.heroStatDot, { backgroundColor: "#007A8A" }]} />
                <Text style={styles.heroStatText}>{stats.totalItems} total</Text>
              </View>
            </View>

            <View style={styles.heroProgressRow}>
              <View style={styles.heroProgressTrack}>
                <View
                  style={[styles.heroProgressFill, { width: `${completionPct}%` as any }]}
                />
              </View>
              <Text style={styles.heroProgressPct}>{completionPct}% complete</Text>
            </View>
          </View>

          {/* ── SPENDING ROW ──────────────────────────────────── */}
          <View style={styles.spendingRow}>
            <View style={[styles.glassCard, styles.spendingLeft]}>
              <Text style={styles.glassLabel}>WEEKLY SPENDING</Text>
              <Text style={styles.spendingValue}>{fmt(stats.weeklySpending)}</Text>
              <WeeklyBars items={items} />
            </View>

            <View style={[styles.glassCard, styles.spendingRight]}>
              <View style={styles.monthBadge}>
                <Text style={styles.monthName}>{MONTH_LABEL}</Text>
                <Text style={styles.monthYear}>{YEAR_LABEL}</Text>
              </View>
              <View style={styles.monthDivider} />
              <Text style={styles.glassLabel}>MONTHLY TOTAL</Text>
              <Text style={styles.monthlyValue}>{fmt(stats.monthlyTotal)}</Text>

              {stats.monthlyTotal > 0 && stats.weeklySpending > 0 && (
                <View style={styles.savingsChip}>
                  <Ionicons name="trending-up-outline" size={10} color="#00FF85" />
                  <Text style={styles.savingsText}>
                    {Math.round((stats.weeklySpending / stats.monthlyTotal) * 100)}% used
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── TOP PURCHASED ITEMS ───────────────────────────── */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Top Purchased Items</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{stats.topItems.length}</Text>
              </View>
            </View>

            {stats.topItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconWrap}>
                  <Text style={{ fontSize: 28 }}>🛒</Text>
                </View>
                <Text style={styles.emptyTitle}>No data yet</Text>
                <Text style={styles.emptyText}>
                  Mark items as purchased to see your top picks here.
                </Text>
              </View>
            ) : (
              <View style={styles.topItemsList}>
                {stats.topItems.map((item, idx) => {
                  const img        = getItemImage(item.name);
                  const barWidth   = (item.qty / stats.maxQty) * 100;
                  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                  const rankColor  = rankColors[idx] ?? "rgba(255,255,255,0.3)";

                  return (
                    <View key={idx} style={styles.topItemRow}>
                      <Text style={[styles.rankNum, { color: idx < 3 ? rankColor : "rgba(255,255,255,0.4)" }]}>
                        {idx + 1}
                      </Text>
                      {img ? (
                        <Image source={img} style={styles.topItemImg} resizeMode="cover" />
                      ) : (
                        <View style={styles.topItemImgPlaceholder}>
                          <Ionicons name="image-outline" size={13} color="rgba(255,255,255,0.3)" />
                        </View>
                      )}
                      <View style={styles.topItemInfo}>
                        <Text style={styles.topItemName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.topItemBarTrack}>
                          <LinearGradient
                            colors={["#7BC9BE", "#00FF85"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.topItemBar, { width: `${barWidth}%` as any }]}
                          />
                        </View>
                      </View>
                      <View style={styles.qtyBadge}>
                        <Text style={styles.qtyBadgeText}>×{item.qty}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── STOCK LEVEL OVERVIEW ──────────────────────────── */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Stock Level Overview</Text>
            </View>

            <View style={styles.stockRow}>
              <DonutChart slices={pieSlices} size={118} />
              <View style={styles.legendCol}>
                {pieSlices.map((sl, i) => (
                  <View key={i} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: sl.color }]} />
                    <Text style={styles.legendLabel}>{sl.label}</Text>
                    <View style={styles.legendCountBadge}>
                      <Text style={styles.legendCount}>{sl.value}</Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearCompleted}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={11} color="#FF6B6B" />
                  <Text style={styles.clearBtnText}>Clear completed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── FEEDBACK BUTTON ───────────────────────────────── */}
          <TouchableOpacity
            style={styles.feedbackBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert("Feedback", "Thank you! Feedback feature coming soon.")
            }
          >
            <LinearGradient
              colors={["rgba(0,130,150,0.85)", "rgba(0,100,120,0.95)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.feedbackInner}
            >
              <View style={styles.feedbackIconWrap}>
                <Ionicons name="chatbox-ellipses" size={18} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedbackTitle}>Send Feedback</Text>
                <Text style={styles.feedbackSub}>Help us improve GROCIFY</Text>
              </View>
              <View style={styles.feedbackArrow}>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  heroCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    ...shadows.card,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#B2E0DC",
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F8F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#B2E0DC",
  },
  greetingLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#007A8A",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  heroStatRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: spacing.sm,
  },
  heroStatChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroStatDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  heroStatText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  heroProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroProgressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#B2E0DC",
    borderRadius: 4,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    backgroundColor: "#007A8A",
    borderRadius: 4,
  },
  heroProgressPct: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },

  glassCard: {
    backgroundColor: "rgba(0,110,130,0.50)",
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.55)",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  spendingRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  spendingLeft: {
    flex: 1.25,
    marginHorizontal: 0,
    marginTop: 0,
    padding: spacing.md,
  },
  spendingRight: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    padding: spacing.md,
  },
  glassLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  spendingValue: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  monthBadge: { marginBottom: spacing.xs },
  monthName: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  monthYear: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
  },
  monthDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: spacing.sm,
  },
  monthlyValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  savingsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,255,133,0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(0,255,133,0.25)",
  },
  savingsText: {
    fontSize: 9,
    color: "#00FF85",
    fontWeight: "700",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.white,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: "800",
  },

  topItemsList: { gap: spacing.sm },
  topItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rankNum: {
    fontSize: 13,
    fontWeight: "900",
    width: 18,
    textAlign: "center",
  },
  topItemImg: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  topItemImgPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  topItemInfo: { flex: 1, gap: 4 },
  topItemName: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  topItemBarTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  topItemBar: {
    height: "100%",
    borderRadius: 3,
  },
  qtyBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  qtyBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: "800",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  emptyText: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 19,
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  legendCol: { flex: 1, gap: 10 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    flex: 1,
  },
  legendCountBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: "center",
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
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  clearBtnText: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "700",
  },

  feedbackBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    ...shadows.card,
  },
  feedbackInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  feedbackIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  feedbackTitle: {
    fontSize: typography.base,
    fontWeight: "800",
    color: colors.white,
    lineHeight: 18,
  },
  feedbackSub: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 14,
  },
  feedbackArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});