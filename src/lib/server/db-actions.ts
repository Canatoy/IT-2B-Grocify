import { desc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { groceryItems } from "./db/schema";

export const listGroceryItems = async () => {
  const rows = await db
    .select()
    .from(groceryItems)
    .orderBy(desc(groceryItems.updated_at));

  return rows;
};

export const createGroceryItem = async (input: {
  name: string;
  category: string;
  quantity: number;
  priority: string;
  estimatedPrice?: number | null;
  totalPrice?: number | null;
}) => {
  const qty       = Math.max(1, input.quantity);
  const unitPrice = input.estimatedPrice ?? null;
  const total     = unitPrice !== null
    ? parseFloat((unitPrice * qty).toFixed(2))
    : null;

  const rows = await db
    .insert(groceryItems)
    .values({
      id:             crypto.randomUUID(),
      name:           input.name,
      category:       input.category,
      quantity:       qty,
      purchased:      false,
      priority:       input.priority,
      updated_at:     Date.now(),
      estimatedPrice: unitPrice,
      totalPrice:     total,
    })
    .returning();

  return rows[0];
};

export const setGroceryItemPurchased = async (
  id: string,
  purchased: boolean,
) => {
  const rows = await db
    .update(groceryItems)
    .set({ purchased, updated_at: Date.now() })
    .where(eq(groceryItems.id, id))
    .returning();

  if (!rows.length) return null;
  return rows[0];
};

export const updateGroceryItemQuantity = async (
  id: string,
  quantity: number,
  totalPrice?: number | null,
) => {
  const qty = Math.max(1, Math.floor(quantity));

  // Recalculate totalPrice from DB if not passed in
  let newTotal = totalPrice ?? null;
  if (newTotal === null) {
    const existing = await db
      .select()
      .from(groceryItems)
      .where(eq(groceryItems.id, id))
      .limit(1);

    if (existing[0]?.estimatedPrice != null) {
      newTotal = parseFloat((existing[0].estimatedPrice * qty).toFixed(2));
    }
  }

  const rows = await db
    .update(groceryItems)
    .set({
      quantity:   qty,
      totalPrice: newTotal,
      updated_at: Date.now(),
    })
    .where(eq(groceryItems.id, id))
    .returning();

  if (!rows.length) return null;
  return rows[0];
};

export const deleteGroceryItem = async (id: string) => {
  await db.delete(groceryItems).where(eq(groceryItems.id, id));
};

export const clearPurchasedItems = async () => {
  await db.delete(groceryItems).where(eq(groceryItems.purchased, true));
};