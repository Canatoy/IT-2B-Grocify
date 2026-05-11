import { View, Text, StyleSheet } from "react-native";
import { useGroceryStore } from "@/store/grocery-store";
import { colors, typography, spacing, radius, shadows, size } from "@/constants/theme";

export default function ListHeroCard() {
  const { items } = useGroceryStore();

  const pending = items.filter((i) => !i.purchased);
  const completed = items.filter((i) => i.purchased);
  const progress = items.length > 0 ? completed.length / items.length : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.todayLabel}>TODAY</Text>
      <Text style={styles.title}>Your Grocery Board</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{pending.length} pending</Text>
        <Text style={styles.statDot}> · </Text>
        <Text style={styles.statText}>{completed.length} completed</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.raised,
  },
  todayLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    fontWeight: typography.semibold,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  statText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  statDot: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: radius.pill,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
  },
});