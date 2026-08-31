import type { AdminRole } from "./api";

const roleLabels: Record<AdminRole, string> = {
  owner: "最高權限",
  manager: "管理員",
  staff: "服務人員"
};

export function getStoredAdminRole(): AdminRole {
  if (typeof window === "undefined") {
    return "staff";
  }
  const role = localStorage.getItem("adminRole");
  return role === "owner" || role === "manager" || role === "staff" ? role : "staff";
}

export function adminRoleLabel(role: string) {
  return roleLabels[role as AdminRole] || role;
}

export function canManageOperations(role: AdminRole) {
  return role === "owner" || role === "manager";
}

export function canManageAccounts(role: AdminRole) {
  return role === "owner";
}

export function canPublishRelease(role: AdminRole) {
  return role === "owner";
}

export function canDeleteSupportTickets(role: AdminRole) {
  return canManageOperations(role);
}
