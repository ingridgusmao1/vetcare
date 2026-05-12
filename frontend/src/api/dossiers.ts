import { api } from '../lib/api';

export interface Dossier {
  reference_dossier: number;
  patient_id: number;
  allergie: string | null;
  intolerance: string | null;
  condition_physique: string | null;
  created_at: string;
  updated_at: string;
}

export const dossiersApi = {
  list: async (): Promise<Dossier[]> => {
    const { data } = await api.get<Dossier[]>('/dossiers');
    return data;
  },

  getById: async (id: number): Promise<Dossier> => {
    const { data } = await api.get<Dossier>(`/dossiers/${id}`);
    return data;
  },

  // Most-used endpoint: from the patient page, fetch the matching dossier.
  byPatient: async (patientId: number): Promise<Dossier> => {
    const { data } = await api.get<Dossier>(`/dossiers/by-patient/${patientId}`);
    return data;
  },

  update: async (
    id: number,
    input: { allergie?: string | null; intolerance?: string | null; condition_physique?: string | null }
  ): Promise<Dossier> => {
    const { data } = await api.put<Dossier>(`/dossiers/${id}`, input);
    return data;
  },
};