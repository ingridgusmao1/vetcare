import { api } from '../lib/api';

export interface Proprietaire {
  reference_prop: number;
  nom: string;
  email: string;
  telephone: string | null;
  created_at: string;
  updated_at: string;
}

export const proprietairesApi = {
  list: async (): Promise<Proprietaire[]> => {
    const { data } = await api.get<Proprietaire[]>('/proprietaires');
    return data;
  },

  getById: async (id: number): Promise<Proprietaire> => {
    const { data } = await api.get<Proprietaire>(`/proprietaires/${id}`);
    return data;
  },

  // Owner's animals — used on the owner detail page.
  animals: async (id: number) => {
    const { data } = await api.get(`/proprietaires/${id}/animals`);
    return data;
  },

  create: async (input: {
    nom: string;
    email: string;
    telephone?: string | null;
  }): Promise<Proprietaire> => {
    const { data } = await api.post<Proprietaire>('/proprietaires', input);
    return data;
  },

  update: async (
    id: number,
    input: Partial<Omit<Proprietaire, 'reference_prop' | 'created_at' | 'updated_at'>>
  ): Promise<Proprietaire> => {
    const { data } = await api.put<Proprietaire>(`/proprietaires/${id}`, input);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/proprietaires/${id}`);
  },
};