import { api } from '../lib/api';

export interface Traitement {
  reference_traitement: number;
  medicament: string;
  status: 'en_cours' | 'termine' | 'suspendu';
  created_at: string;
  updated_at: string;
}

export interface TraitementFilter {
  status?: Traitement['status'];
  patient_id?: number;
  dossier_id?: number;
}

export const traitementsApi = {
  list: async (filter?: TraitementFilter): Promise<Traitement[]> => {
    const { data } = await api.get<Traitement[]>('/traitements', { params: filter });
    return data;
  },

  getById: async (id: number): Promise<Traitement> => {
    const { data } = await api.get<Traitement>(`/traitements/${id}`);
    return data;
  },

  // US-16: list ongoing treatments for a patient.
  activeByPatient: async (patientId: number): Promise<Traitement[]> => {
    const { data } = await api.get<Traitement[]>(`/traitements/active-by-patient/${patientId}`);
    return data;
  },

  create: async (input: {
    medicament: string;
    status?: Traitement['status'];
    patient_id: number;
    dossier_id?: number | null;
  }): Promise<Traitement> => {
    const { data } = await api.post<Traitement>('/traitements', input);
    return data;
  },

  update: async (
    id: number,
    input: { medicament?: string; status?: Traitement['status'] }
  ): Promise<Traitement> => {
    const { data } = await api.put<Traitement>(`/traitements/${id}`, input);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/traitements/${id}`);
  },
};