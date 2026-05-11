import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGroceryStore, GroceryItem } from "@/store/grocery-store";
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  size,
  priorityColors,
} from "@/constants/theme";

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

const CATEGORY_BG: Record<string, string> = {
  Fruits:     "#FFF0E0",
  Vegetables: "#E8F5E9",
  Dairy:      "#E3F2FD",
  Snacks:     "#FFF8E1",
  Pantry:     "#F3E5F5",
  Grain:      "#EFEBE9",
  Meat:       "#FCE4EC",
  Seafood:    "#E0F7FA",
};

type Props = { item: GroceryItem };

export default function PendingItemCard({ item }: Props) {
  const { togglePurchased, updateQuantity, removeItem } = useGroceryStore();

  const pc = priorityColors(item.priority);
  const emoji = CATEGORY_EMOJI[item.category] ?? "🛒";
  const emojiBg = CATEGORY_BG[item.category] ?? colors.tealFaint;

  return (
    <View style={styles.card}>
      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => togglePurchased(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Mark ${item.name} as purchased`}
      />

      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: emojiBg }]}>
        <Text style={styles.thumbnailEmoji}>{emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.priorityText, { color: pc.text }]}>
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Delete ${item.name}`}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Category pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{item.category}</Text>
        </View>

        {/* Quantity controls */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={16} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.card,
  },
  checkbox: {
    width: size.checkboxSize,
    height: size.checkboxSize,
    borderRadius: size.checkboxSize / 2,
    borderWidth: 2,
    borderColor: colors.teal,
    flexShrink: 0,
  },
  thumbnail: {
    width: size.itemThumbnail,
    height: size.itemThumbnail,
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
    gap: spacing.xs,
  },
  itemName: {
    fontWeight: typography.bold,
    fontSize: typography.base,
    color: colors.textPrimary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  priorityText: { fontSize: 10, fontWeight: typography.bold },
  categoryPill: {
    backgroundColor: colors.tealFaint,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  categoryPillText: {
    fontSize: typography.xs,
    color: colors.tealDark,
    fontWeight: typography.semibold,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  qtyBtn: {
    width: size.qtyButton,
    height: size.qtyButton,
    borderRadius: size.qtyButton / 2,
    backgroundColor: colors.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontWeight: typography.bold,
    fontSize: typography.base,
    minWidth: 20,
    textAlign: "center",
    color: colors.textPrimary,
  },
});