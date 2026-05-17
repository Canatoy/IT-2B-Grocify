import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGroceryStore, GroceryItem } from "@/store/grocery-store";
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  size,
} from "@/constants/theme";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// Warm gradient pairs per category — same as Planner CATEGORY_BG feel
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

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "#E74C3C", bg: "rgba(231,76,60,0.15)"  },
  medium: { label: "Medium", color: "#F39C12", bg: "rgba(243,156,18,0.15)" },
  low:    { label: "Low",    color: "#2ECC71", bg: "rgba(46,204,113,0.15)" },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatPrice = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { item: GroceryItem };

export default function PendingItemCard({ item }: Props) {
  const { togglePurchased, updateQuantity, removeItem } = useGroceryStore();

  const pCfg      = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.low;
  const emoji     = CATEGORY_EMOJI[item.category] ?? "🛒";
  const catBg     = CATEGORY_BG[item.category] ?? (["#F0F0F0", "#DDD"] as [string, string]);
  const hasPrice  = item.estimatedPrice !== undefined && item.estimatedPrice !== null;
  const lineTotal = hasPrice
    ? (item.totalPrice ?? item.estimatedPrice! * item.quantity)
    : null;

  return (
    <View style={styles.card}>

      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => togglePurchased(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Mark ${item.name} as purchased`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
      />

      {/* Emoji thumbnail with gradient */}
      <LinearGradient colors={catBg} style={styles.thumbnail}>
        <Text style={styles.thumbnailEmoji}>{emoji}</Text>
      </LinearGradient>

      {/* Info block */}
      <View style={styles.itemInfo}>

        {/* Row 1: name + priority badge + delete */}
        <View style={styles.itemTopRow}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemTopActions}>
            <View style={[styles.priorityBadge, { backgroundColor: pCfg.bg, borderColor: pCfg.color }]}>
              <Text style={[styles.priorityText, { color: pCfg.color }]}>
                {pCfg.label}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Delete ${item.name}`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: category pill + unit price */}
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{item.category}</Text>
          </View>
          {hasPrice && (
            <Text style={styles.unitPrice}>
              {formatPrice(item.estimatedPrice!)} / unit
            </Text>
          )}
        </View>

        {/* Row 3: qty controls + line total */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Decrease quantity"
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
            accessibilityLabel="Increase quantity"
          >
            <Ionicons name="add" size={14} color={colors.white} />
          </TouchableOpacity>

          {/* Line total pushed to the right */}
          {lineTotal !== null && (
            <Text style={styles.lineTotal}>{formatPrice(lineTotal)}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Glass card — matches Planner formCard style on the teal gradient bg
  card: {
    backgroundColor: "rgba(0, 130, 150, 0.40)",
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    flexShrink: 0,
  },

  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  thumbnailEmoji: { fontSize: 26 },

  itemInfo: { flex: 1, minWidth: 0 },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
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
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: typography.bold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 5,
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
  unitPrice: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    fontWeight: typography.medium,
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
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  qtyPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
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
  lineTotal: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: typography.bold,
    color: "rgba(255,255,255,0.9)",
  },
});