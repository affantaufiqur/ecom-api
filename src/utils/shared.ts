export const ROLE = {
  ["regular_user"]: {
    name: "regular_user",
    level: 1,
  },
  ["seller"]: {
    name: "seller",
    level: 2,
  },
};

export function getRoleLevel(role: keyof typeof ROLE) {
  return ROLE[role].level;
}
