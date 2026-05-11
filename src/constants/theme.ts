// ─────────────────────────────────────────────
//  theme.ts  —  single source of truth for all
//  design tokens across the grocery app
// ─────────────────────────────────────────────

// ── Brand colors ──────────────────────────────
export const colors = {
  // Primary teal palette (matches Figma)
  teal: "#008296",
  tealDark: "#006373",
  tealDeep: "#005f6e",
  tealCard: "#00707f",
  tealLight: "#7BC9BE",
  tealFaint: "#E1F5EE",

  // Surfaces
  white: "#FFFFFF",
  black: "#1a1a1a",

  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textMuted: "#999999",
  textOnTeal: "#FFFFFF",
  textOnTealMuted: "rgba(255,255,255,0.65)",

  // Priority badges
  priority: {
    low: {
      bg: "#E1F5EE",
      text: "#085041",
    },
    medium: {
      bg: "#FFF9C4",
      text: "#7B5800",
    },
    high: {
      bg: "#FCEBEB",
      text: "#A32D2D",
    },
  },

  // Category card backgrounds (matches Figma)
  category: {
    Fruits:     "#E24B4A",
    Vegetables: "#3B6D11",
    Dairy:      "#BA7517",
    Snacks:     "#712B13",
    Pantry:     "#8e24aa",
    Grain:      "#6d4c41",
    Meat:       "#c62828",
    Seafood:    "#0288d1",
  },

  // UI feedback
  success: "#1D9E75",
  danger:  "#E24B4A",
  warning: "#BA7517",

  // Borders & dividers
  border:        "rgba(0,0,0,0.08)",
  borderOnTeal:  "rgba(255,255,255,0.2)",

  // Backgrounds
  inputBg:       "rgba(225,245,238,0.85)",
  formCardBg:    "rgba(255,255,255,0.22)",
  completedBg:   "#F7FFFE",
  emojiBg:       "#F0FAFA",

  // Shadows
  shadow: "#000000",
} as const;

// ── Typography ────────────────────────────────
export const typography = {
  // Font sizes
  xs:   11,
  sm:   12,
  md:   13,
  base: 14,
  lg:   16,
  xl:   18,
  xxl:  22,

  // Font weights (RN uses string literals)
  regular:   "500" as const,
  medium:    "600" as const,
  semibold:  "700" as const,
  bold:      "800" as const,
  extrabold: "900" as const,

  // Letter spacing
  tight:  0.5,
  normal: 0,
  wide:   1.5,
  wider:  2,
} as const;

// ── Spacing ───────────────────────────────────
export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
} as const;

// ── Border radius ─────────────────────────────
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  pill: 100,
} as const;

// ── Shadows ───────────────────────────────────
//  Two levels — use "card" for most surfaces,
//  "subtle" for items sitting on white.
export const shadows = {
  card: {
    shadowColor:   colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius:  4,
    shadowOffset:  { width: 0, height: 2 },
    elevation:     2,
  },
  raised: {
    shadowColor:   colors.shadow,
    shadowOpacity: 0.10,
    shadowRadius:  8,
    shadowOffset:  { width: 0, height: 4 },
    elevation:     4,
  },
} as const;

// ── Icon sizes ────────────────────────────────
export const iconSize = {
  sm:  16,
  md:  20,
  lg:  24,
} as const;

// ── Component sizing ──────────────────────────
export const size = {
  tabBarHeight:     56,
  headerCardRadius: radius.xl,
  itemThumbnail:    52,
  checkboxSize:     22,
  qtyButton:        32,
  categoryCard:     72,  
  quickSlotHeight:  64,
  inputHeight:      44,
  buttonHeight:     48,
} as const;

// ── Helpers ───────────────────────────────────

/** Returns the priority badge colors for a given level. */
export function priorityColors(level: "low" | "medium" | "high") {
  return colors.priority[level] ?? colors.priority.low;
}

/** Returns the background color for a given category name. */
export function categoryColor(name: string): string {
  return (colors.category as Record<string, string>)[name] ?? colors.teal;
}