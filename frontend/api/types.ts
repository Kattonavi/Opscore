// ──────────────────────────────────────────────
// Shared API types — consumed by all features
// ──────────────────────────────────────────────

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  OPERATOR = "OPERATOR",
  SUPERVISOR = "SUPERVISOR",
  TECHNICIAN = "TECHNICIAN",
}

// ── Auth ───────────────────────────────────────

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

// ── User ───────────────────────────────────────

export interface UserResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  area: string | null;
  active: boolean;
  avatar: string | null;
}

export interface CreateUserRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  areaId?: number | null;
  avatar?: string | null;
}

export interface UpdateUserRoleDTO {
  roleId: number;
}

export interface UpdateUserStatusDTO {
  active: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
