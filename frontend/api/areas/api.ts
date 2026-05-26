import apiClient from "../client";
import type { AreaResponseDTO } from "./types";

export const areasApi = {
  /** GET /areas */
  getAll: async (): Promise<AreaResponseDTO[]> => {
    const { data } = await apiClient.get("/areas");
    return data;
  },

  /** GET /areas/{id} */
  getById: async (id: number): Promise<AreaResponseDTO> => {
    const { data } = await apiClient.get(`/areas/${id}`);
    return data;
  },
};
