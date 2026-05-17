import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGroceryStore } from "@/store/grocery-store";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";

const formatPrice = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ListHeroCard() {
  const { items, getTotalEstimatedCost } = useGroceryStore();

  const pending   = items.filter((i) => !i.purchased);
  const completed = items.filter((i) => i.purchased);
  const progress  = items.length > 0 ? completed.length / items.length : 0;
  const pct       = Math.round(progress * 100);

  const pendingCost  = getTotalEstimatedCost();
  const hasPriceData = pending.some((i) => i.estimatedPrice != null);

  return (
    <View style={styles.card}>
      {/* Top row: TODAY label + % done pill */}
      <View style={styles.topRow}>
        <Text style={styles.todayLabel}>TODAY</Text>
        {items.length > 0 && (
          <View style={styles.pctPill}>
            <Text style={styles.pctText}>{pct}% done</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>Your Grocery Board</Text>

      {/* Stat chips */}
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

      {/* Estimated total — only when items have price data */}
      {hasPriceData && (
        <View style={styles.totalRow}>
          <Ionicons name="receipt-outline" size={13} color={colors.teal} />
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>{formatPrice(pendingCost)}</Text>
        </View>
      )}

      {/* Progress bar — flush to card bottom */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={["#62C4BC", "#006A7A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${pct}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,       // progress bar is flush to bottom
    overflow: "hidden",
    ...shadows.raised,
  },

  topRow: {
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

  title: {
    fontSize: typography.xxl,
    fontWeight: "900" as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  statChipRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
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

  // Estimated total row inside hero card
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FAFA",
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#C8E8EA",
  },
  totalLabel: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  totalValue: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.teal,
  },

  // Progress bar flush to card bottom edge
  progressTrack: {
    height: 5,
    backgroundColor: "#EEEEEE",
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});