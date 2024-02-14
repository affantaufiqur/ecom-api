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
