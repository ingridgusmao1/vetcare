import { api } from '../lib/api';

export interface Consultation {
  reference_consultation: number;
  patient_id: number;
  veterinaire_id: number;
  date: string;
  status: 'prevue' | 'terminee' | 'annulee';
  motif: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationFilter {
  patient_id?: number;
  veterinaire_id?: number;
  status?: Consultation['status'];
  date_from?: string;
  date_to?: string;
}

export const consultationsApi = {
  list: async (filter?: ConsultationFilter): Promise<Consultation[]> => {
    const { data } = await api.get<Consultation[]>('/consultations', { params: filter });
    return data;
  },

  getById: async (id: number): Promise<Consultation> => {
    const { data } = await api.get<Consultation>(`/consultations/${id}`);
    return data;
  },

  byPatient: async (patientId: number): Promise<Consultation[]> => {
    const { data } = await api.get<Consultation[]>(`/consultations/by-patient/${patientId}`);
    return data;
  },

  create: async (input: {
    patient_id: number;
    veterinaire_id: number;
    date: string;
    status?: Consultation['status'];
    motif?: string | null;
  }): Promise<Consultation> => {
    const { data } = await api.post<Consultation>('/consultations', input);
    return data;
  },

  update: async (
    id: number,
    input: Partial<Omit<Consultation, 'reference_consultation' | 'created_at' | 'updated_at'>>
  ): Promise<Consultation> => {
    const { data } = await api.put<Consultation>(`/consultations/${id}`, input);
    return data;
  },

  // Dedicated endpoint for the most common change — status transitions (US-12).
  updateStatus: async (id: number, status: Consultation['status']): Promise<Consultation> => {
    const { data } = await api.patch<Consultation>(`/consultations/${id}/status`, { status });
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/consultations/${id}`);
  },
};