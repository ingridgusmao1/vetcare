import { api } from '../lib/api';

// Shape returned by GET /api/dashboard/stats.
export interface DashboardStats {
  animaux_suivis: number;
  consultations_semaine: number;
  traitements_en_cours: number;
}

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};