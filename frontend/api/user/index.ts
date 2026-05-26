"use client";

import apiClient from "@/api/client";
import type {
  UserResponseDTO,
  CreateUserRequestDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
  ChangePasswordDTO,
} from "@/api/types";

export type {
  UserResponseDTO,
  CreateUserRequestDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
  ChangePasswordDTO,
} from "@/api/types";

export const usersApi = {
  /** POST /users — requires ADMIN */
  create: async (data: CreateUserRequestDTO): Promise<UserResponseDTO> => {
    const { data: res } = await apiClient.post("/users", data);
    return res;
  },

  /** GET /users/{id} — requires ADMIN */
  getById: async (id: number): Promise<UserResponseDTO> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  /** GET /users — requires ADMIN */
  getAll: async (): Promise<UserResponseDTO[]> => {
    const { data } = await apiClient.get("/users");
    return data;
  },

  /** GET /users/assignable — requires ADMIN or SUPERVISOR */
  getAssignable: async (): Promise<UserResponseDTO[]> => {
    const { data } = await apiClient.get("/users/assignable");
    return data;
  },

  /** GET /users/me */
  me: async (): Promise<UserResponseDTO> => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  /** PATCH /users/{id}/role — requires ADMIN */
  updateRole: async (
    id: number,
    payload: UpdateUserRoleDTO,
  ): Promise<UserResponseDTO> => {
    const { data } = await apiClient.patch(`/users/${id}/role`, payload);
    return data;
  },

  /** PATCH /users/{id}/status — requires ADMIN */
  updateStatus: async (
    id: number,
    payload: UpdateUserStatusDTO,
  ): Promise<UserResponseDTO> => {
    const { data } = await apiClient.patch(`/users/${id}/status`, payload);
    return data;
  },

  /** PATCH /users/change-password */
  changePassword: async (payload: ChangePasswordDTO): Promise<void> => {
    await apiClient.patch("/users/change-password", payload);
  },
};
