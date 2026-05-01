export type AppRole = "JUDGE" | "LAWYER" | "ADMIN";

export function normalizeRole(role: unknown): AppRole {
  if (typeof role !== "string") return "LAWYER";
  if (role.toUpperCase() === "ADMIN") return "ADMIN";
  return role.toUpperCase() === "JUDGE" ? "JUDGE" : "LAWYER";
}

export function dashboardForRole(role: unknown) {
  return normalizeRole(role) === "JUDGE" ? "/judge/dashboard" : "/lawyer/dashboard";
}

export function signInRoleKeyToAppRole(roleKey: string): AppRole {
  return roleKey === "judge" ? "JUDGE" : "LAWYER";
}

export function searchRoleToSignInKey(role: string | null) {
  return normalizeRole(role) === "JUDGE" ? "judge" : "complainant_lawyer";
}
