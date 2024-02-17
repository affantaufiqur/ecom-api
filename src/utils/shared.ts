export const ROLE = {
  ["regular_user"]: {
    name: "regular_user",
    level: 1,
  },
  ["seller"]: {
    name: "seller",
    level: 2,
  },
} as const;

export const ROLE_NAME = Object.keys(ROLE) as unknown as keyof typeof ROLE;

export function getRoleLevel(role: keyof typeof ROLE) {
  return ROLE[role].level;
}

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Beauty",
  "Toys & Games",
  "Sports & Outdoors",
  "Automotive",
  "Health & Personal Care",
  "Grocery",
  "Tools & Home Improvement",
  "Baby",
  "Pet Supplies",
  "Office Products",
  "Movies & TV",
  "Music",
  "Industrial & Scientific",
  "Jewelry",
  "Software",
  "Video Games",
] as const;

export function formatStringToSQLPercent(string: string) {
  return "%" + string + "%";
}
