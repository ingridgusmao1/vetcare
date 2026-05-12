import { api } from '../lib/api';

export interface Patient {
  reference_patient: number;
  nom: string;
  espece: 'chien' | 'chat' | 'lapin' | 'oiseau' | 'reptile' | 'rongeur' | 'autre';
  veterinaire: string | null;
  actif: boolean;
  proprietaire_id: number;
  created_at: string;
  updated_at: string;
}

// Filter shape mirrors the backend's findPatientsQuerySchema.
export interface PatientFilter {
  search?: string;
  espece?: Patient['espece'];
  actif?: boolean;
}

export const patientsApi = {
  // GET /api/patients with optional filters as URL query params.
  list: async (filter?: PatientFilter): Promise<Patient[]> => {
    const { data } = await api.get<Patient[]>('/patients', { params: filter });
    return data;
  },

  getById: async (id: number): Promise<Patient> => {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    return data;
  },

  create: async (input: {
    nom: string;
    espece: Patient['espece'];
    veterinaire?: string | null;
    proprietaire_id: number;
  }): Promise<Patient> => {
    const { data } = await api.post<Patient>('/patients', input);
    return data;
  },

  update: async (
    id: number,
    input: Partial<Omit<Patient, 'reference_patient' | 'created_at' | 'updated_at'>>
  ): Promise<Patient> => {
    const { data } = await api.put<Patient>(`/patients/${id}`, input);
    return data;
  },

  // Soft-delete = the backend just flips actif to false. The UI receives the
  // updated patient and can mark it inactive without refetching the whole list.
  softDelete: async (id: number): Promise<Patient> => {
    const { data } = await api.delete<Patient>(`/patients/${id}`);
    return data;
  },
};