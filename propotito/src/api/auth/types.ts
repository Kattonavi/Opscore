// Enums y tipos para Autenticación y Usuarios

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  SUPERVISOR = 'SUPERVISOR',
  TECHNICIAN = 'TECHNICIAN',
}

// DTOs de Autenticación

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

// DTOs de Usuarios

export interface CreateUserRequestDTO {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

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

export interface UpdateUserRoleDTO {
  role: Role;
}

export interface UpdateUserStatusDTO {
  active: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
