import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGroceryStore } from "@/store/grocery-store";
import { colors, typography, spacing, radius, shadows } from "@/constants/theme";

export default function CompletedItems() {
  const { items, togglePurchased, removeItem, clearPurchased } = useGroceryStore();
  const completed = items.filter((i) => i.purchased);

  if (completed.length === 0) return null;

  const handleClear = () => {
    Alert.alert("Clear Completed", "Remove all completed items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => clearPurchased() },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>COMPLETED</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>
      {completed.map((item) => (
        <View key={item.id} style={styles.item}>
          <TouchableOpacity
            onPress={() => togglePurchased(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.check}>
              <Ionicons name="checkmark" size={13} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.itemName}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    letterSpacing: typography.wide,
    color: colors.textSecondary,
  },
  clearText: {
    fontSize: typography.sm,
    color: colors.teal,
    fontWeight: typography.semibold,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: spacing.sm,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    flex: 1,
    textDecorationLine: "line-through",
    color: colors.textMuted,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
});