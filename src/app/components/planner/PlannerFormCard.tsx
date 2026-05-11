import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
import { useGroceryStore, GroceryCategory, GroceryPriority } from "@/store/grocery-store";
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  size,
} from "@/constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 3) / 4;

const CATEGORIES: { id: string; name: GroceryCategory; emoji: string; grad: readonly [string, string] }[] = [
  { id: "1", name: "Produce",    emoji: "🥦", grad: ["#43a047", "#2e7d32"] },
  { id: "2", name: "Dairy",      emoji: "🧀", grad: ["#fb8c00", "#e65100"] },
  { id: "3", name: "Bakery",     emoji: "🍞", grad: ["#f9a825", "#f57f17"] },
  { id: "4", name: "Pantry",     emoji: "🥫", grad: ["#8e24aa", "#6a1b9a"] },
  { id: "5", name: "Snacks",     emoji: "🍿", grad: ["#6d4c41", "#3e2723"] },
];

const FREQUENT_ITEMS = [
  { id: "1", name: "Avocado", category: "Produce" as GroceryCategory, emoji: "🥑" },
  { id: "2", name: "Milk",    category: "Dairy"   as GroceryCategory, emoji: "🥛" },
  { id: "3", name: "Bread",   category: "Bakery"  as GroceryCategory, emoji: "🍞" },
  { id: "4", name: "Eggs",    category: "Dairy"   as GroceryCategory, emoji: "🥚" },
  { id: "5", name: "Sugar",   category: "Pantry"  as GroceryCategory, emoji: "🍬" },
  { id: "6", name: "Rice",    category: "Pantry"  as GroceryCategory, emoji: "🍚" },
];

export default function PlannerFormCard() {
  const { addItem } = useGroceryStore();

  const [itemName,         setItemName]         = useState("");
  const [quantity,         setQuantity]         = useState("1");
  const [selectedCategory, setSelectedCategory] = useState<GroceryCategory | "">("");
  const [selectedPriority, setSelectedPriority] = useState<GroceryPriority>("low");
  const [loading,          setLoading]          = useState(false);

  const handleAdd = async () => {
    if (!itemName.trim()) { Alert.alert("Missing Info", "Please enter an item name."); return; }
    if (!selectedCategory) { Alert.alert("Missing Info", "Please select a category."); return; }

    try {
      setLoading(true);
      await addItem({
        name: itemName.trim(),
        category: selectedCategory,
        quantity: parseInt(quantity) || 1,
        priority: selectedPriority,
      });
      Alert.alert("Added! ✅", `${itemName} added to your list.`);
      setItemName(""); setQuantity("1"); setSelectedCategory(""); setSelectedPriority("low");
    } catch {
      Alert.alert("Error", "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formCard}>
      {/* Categories */}
      <Text style={styles.inputLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.name)}
              style={[styles.categoryWrapper, { width: CARD_SIZE, height: CARD_SIZE }, isSelected && styles.categorySelected]}
              activeOpacity={0.85}
            >
              <LinearGradient colors={cat.grad} style={styles.categoryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Item Name */}
      <Text style={styles.inputLabel}>Item name</Text>
      <View style={styles.inputRow}>
        <Ionicons name="clipboard-outline" size={16} color={colors.teal} style={{ marginRight: spacing.sm }} />
        <TextInput
          style={styles.input}
          placeholder="Ex: Squash"
          placeholderTextColor={colors.tealLight}
          value={itemName}
          onChangeText={setItemName}
        />
      </View>

      {/* Quantity */}
      <Text style={styles.inputLabel}>Quantity</Text>
      <View style={styles.inputRow}>
        <Text style={styles.hashIcon}>#</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          placeholderTextColor={colors.tealLight}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      {/* Priority */}
      <Text style={styles.inputLabel}>Priority</Text>
      <View style={styles.priorityRow}>
        {(["low", "medium", "high"] as GroceryPriority[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.priorityBtn, selectedPriority === p && styles.priorityBtnActive]}
            onPress={() => setSelectedPriority(p)}
          >
            <Text style={[styles.priorityBtnText, selectedPriority === p && styles.priorityBtnTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addBtn, loading && { opacity: 0.7 }]}
        onPress={handleAdd}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.teal} style={{ marginRight: spacing.xs }} />
        <Text style={styles.addBtnText}>{loading ? "Adding..." : "Add to List"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.formCardBg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderOnTeal,
  },
  inputLabel: {
    color: colors.white,
    fontWeight: typography.semibold,
    fontSize: typography.md,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.card,
  },
  categorySelected: {
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  categoryGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  categoryName: {
    color: colors.white,
    fontWeight: typography.bold,
    fontSize: 9,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: size.inputHeight,
  },
  hashIcon: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.teal,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: size.inputHeight,
    color: colors.tealDark,
    fontSize: typography.base,
  },
  priorityRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: colors.borderOnTeal,
  },
  priorityBtnActive: { backgroundColor: colors.white },
  priorityBtnText: {
    color: colors.textOnTealMuted,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  priorityBtnTextActive: { color: colors.teal },
  addBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    height: size.buttonHeight,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    ...shadows.card,
  },
  addBtnText: {
    color: colors.teal,
    fontWeight: typography.extrabold,
    fontSize: typography.lg,
  },
});