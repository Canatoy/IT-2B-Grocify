import { create } from "zustand";

export type GroceryCategory =
  | "Fruits"
  | "Vegetables"
  | "Dairy"
  | "Snacks"
  | "Pantry"
  | "Grain"
  | "Meat"
  | "Seafood";

export type GroceryPriority = "low" | "medium" | "high";

export type GroceryItem = {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity: number;
  purchased: boolean;
  priority: GroceryPriority;
  updated_at: number;
  // ── Price fields (optional — items added before this update won't have them) ──
  estimatedPrice?: number; // price per unit
  totalPrice?: number;     // estimatedPrice × quantity
};

export type CreateItemInput = {
  name: string;
  category: GroceryCategory;
  quantity: number;
  priority: GroceryPriority;
  estimatedPrice?: number;
  totalPrice?: number;
};

type ItemsResponse = { items: GroceryItem[] };
type ItemResponse  = { item: GroceryItem };

type GroceryStore = {
  items: GroceryItem[];
  isLoading: boolean;
  error: string | null;

  loadItems:       () => Promise<void>;
  addItem:         (input: CreateItemInput) => Promise<GroceryItem | void>;
  updateQuantity:  (id: string, quantity: number) => Promise<void>;
  togglePurchased: (id: string) => Promise<void>;
  removeItem:      (id: string) => Promise<void>;
  clearPurchased:  () => Promise<void>;

  // ── Derived helpers (called inline — no extra re-renders) ──────────────────
  getTotalEstimatedCost: () => number;
  getPendingCost:        () => number;
};

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  items:     [],
  isLoading: false,
  error:     null,

  // ── Load ────────────────────────────────────────────────────────────────────
  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res     = await fetch("/api/items");
      const payload = (await res.json()) as ItemsResponse;
      if (!res.ok) throw new Error("Request failed");
      set({ items: payload.items });
    } catch (error) {
      console.error("Error loading items:", error);
      set({ error: "Something went wrong" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Add ─────────────────────────────────────────────────────────────────────
  addItem: async (input) => {
    set({ error: null });
    try {
      const qty        = Math.max(1, input.quantity);
      const unitPrice  = input.estimatedPrice ?? undefined;
      const calcTotal  = unitPrice !== undefined ? parseFloat((unitPrice * qty).toFixed(2)) : undefined;

      const res = await fetch("/api/items", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           input.name,
          category:       input.category,
          quantity:       qty,
          priority:       input.priority,
          estimatedPrice: unitPrice,
          totalPrice:     calcTotal,
        }),
      });
      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error("Request failed");
      set((state) => ({ items: [payload.item, ...state.items] }));
      return payload.item;
    } catch (error) {
      console.error("Error adding item:", error);
      set({ error: "Something went wrong" });
    }
  },

  // ── Update quantity (also recalculates totalPrice if estimatedPrice exists) ─
  updateQuantity: async (id, quantity) => {
    const nextQty  = Math.max(1, quantity);
    const current  = get().items.find((i) => i.id === id);
    const newTotal =
      current?.estimatedPrice !== undefined
        ? parseFloat((current.estimatedPrice * nextQty).toFixed(2))
        : undefined;

    set({ error: null });
    try {
      const res = await fetch(`/api/items/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQty, totalPrice: newTotal }),
      });
      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error("Request failed");
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? payload.item : item)),
      }));
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ error: "Something went wrong" });
    }
  },

  // ── Toggle purchased ────────────────────────────────────────────────────────
  togglePurchased: async (id) => {
    const currentItem = get().items.find((item) => item.id === id);
    if (!currentItem) return;
    set({ error: null });
    try {
      const res = await fetch(`/api/items/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased: !currentItem.purchased }),
      });
      const payload = (await res.json()) as ItemResponse;
      if (!res.ok) throw new Error("Request failed");
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? payload.item : item)),
      }));
    } catch (error) {
      console.error("Error toggling purchased:", error);
      set({ error: "Something went wrong" });
    }
  },

  // ── Remove ──────────────────────────────────────────────────────────────────
  removeItem: async (id) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Request failed");
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    } catch (error) {
      console.error("Error removing item:", error);
      set({ error: "Something went wrong" });
    }
  },

  // ── Clear purchased ─────────────────────────────────────────────────────────
  clearPurchased: async () => {
    set({ error: null });
    try {
      const res = await fetch("/api/items/clear-purchased", { method: "POST" });
      if (!res.ok) throw new Error("Request failed");
      set((state) => ({ items: state.items.filter((item) => !item.purchased) }));
    } catch (error) {
      console.error("Error clearing purchased:", error);
      set({ error: "Something went wrong" });
    }
  },

  // ── Derived: total estimated cost of ALL items ───────────────────────────────
  getTotalEstimatedCost: () => {
    return get()
      .items.filter((i) => !i.purchased)
      .reduce((sum, i) => {
        const lineTotal = i.totalPrice ?? (i.estimatedPrice !== undefined ? i.estimatedPrice * i.quantity : 0);
        return sum + lineTotal;
      }, 0);
  },

  // ── Derived: cost of pending items only ─────────────────────────────────────
  getPendingCost: () => {
    return get()
      .items.filter((i) => !i.purchased)
      .reduce((sum, i) => {
        const lineTotal = i.totalPrice ?? (i.estimatedPrice !== undefined ? i.estimatedPrice * i.quantity : 0);
        return sum + lineTotal;
      }, 0);
  },
}));