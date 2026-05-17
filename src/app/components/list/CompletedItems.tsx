import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGroceryStore } from "@/store/grocery-store";
import { colors, typography, spacing, radius } from "@/constants/theme";

const CATEGORY_EMOJI: Record<string, string> = {
  Fruits:     "🍎",
  Vegetables: "🥦",
  Dairy:      "🧀",
  Snacks:     "🍿",
  Pantry:     "🥫",
  Grain:      "🍞",
  Meat:       "🥩",
  Seafood:    "🐟",
};

const formatPrice = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function CompletedItems() {
  const { items, togglePurchased, removeItem, clearPurchased } = useGroceryStore();
  const completed = items.filter((i) => i.purchased);

  if (completed.length === 0) return null;

  // Total spent on completed items
  const spentTotal = completed.reduce((sum, i) => {
    const line = i.totalPrice ?? (i.estimatedPrice != null ? i.estimatedPrice * i.quantity : 0);
    return sum + line;
  }, 0);
  const hasAnyPrice = completed.some((i) => i.estimatedPrice != null);

  const handleClear = () => {
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear",  style: "destructive", onPress: () => clearPurchased() },
    ]);
  };

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.label}>COMPLETED · {completed.length}</Text>
        </View>
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearBtn}
          accessibilityLabel="Clear all completed items"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={13} color="#FF6B6B" />
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      {completed.map((item) => {
        const hasPrice  = item.estimatedPrice != null;
        const lineTotal = hasPrice
          ? (item.totalPrice ?? item.estimatedPrice! * item.quantity)
          : null;

        return (
          <View key={item.id} style={styles.item}>
            {/* Re-open checkbox */}
            <TouchableOpacity
              onPress={() => togglePurchased(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Unmark ${item.name}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: true }}
            >
              <View style={styles.check}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            </TouchableOpacity>

            <Text style={styles.emoji}>
              {CATEGORY_EMOJI[item.category] ?? "🛒"}
            </Text>

            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>

            {lineTotal !== null && (
              <Text style={styles.itemPrice}>{formatPrice(lineTotal)}</Text>
            )}

            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Delete ${item.name}`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Spent subtotal */}
      {hasAnyPrice && (
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Total spent</Text>
          <Text style={styles.subtotalValue}>{formatPrice(spentTotal)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Glass card — same as PendingItemCard / Planner formCard
  card: {
    backgroundColor: "rgba(0, 130, 150, 0.40)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    letterSpacing: typography.wide,
    color: "rgba(255,255,255,0.85)",
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

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    gap: spacing.sm,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(46,204,113,0.3)",
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 16 },
  itemName: {
    flex: 1,
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.45)",
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  itemPrice: {
    fontSize: 12,
    color: "rgba(255,255,255,0.40)",
    fontWeight: typography.medium,
    textDecorationLine: "line-through",
  },

  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  subtotalLabel: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.6)",
    fontWeight: typography.medium,
  },
  subtotalValue: {
    fontSize: typography.sm,
    color: "rgba(255,255,255,0.6)",
    fontWeight: typography.bold,
  },
});