import {
  UtensilsCrossed, Plane, ShoppingBag, FileText, Home, Briefcase,
  Wallet, Code, TrendingUp, Gift, Banknote
} from "lucide-react";

export const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "House Rent", "Other"];

export const CAT_COLORS = {
  Food: "#E3DADE",
  Travel: "#7BAFD4",
  Shopping: "#D8959B",
  Bills: "#829672",
  "House Rent": "#5A9E6F",
  Other: "#8b5cf6",
};

export const CAT_ICON = {
  Food: UtensilsCrossed,
  Travel: Plane,
  Shopping: ShoppingBag,
  Bills: FileText,
  "House Rent": Home,
  Other: Briefcase,
};

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other Income"];

export const INC_COLORS = {
  Salary: "#10b981", Freelance: "#3b82f6", Investment: "#f59e0b",
  Gift: "#ec4899", "Other Income": "#8b5cf6",
};

export const INC_ICON = {
  Salary: Wallet,
  Freelance: Code,
  Investment: TrendingUp,
  Gift: Gift,
  "Other Income": Banknote,
};

export const CAT_EMOJI = {
  Food: "UtensilsCrossed", Travel: "Plane", Shopping: "ShoppingBag",
  Bills: "FileText", "House Rent": "Home", Other: "Briefcase",
};

export const INC_EMOJI = {
  Salary: "Wallet", Freelance: "Code", Investment: "TrendingUp",
  Gift: "Gift", "Other Income": "Banknote",
};
