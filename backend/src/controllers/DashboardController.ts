import { Request, Response, NextFunction } from 'express';
import { PatientModel } from '../models/PatientModel';
import { ConsultationModel } from '../models/ConsultationModel';
import { TraitementModel } from '../models/TraitementModel';

export class DashboardController {
  // GET /api/dashboard/stats
  // Returns the 3 KPIs shown on the dashboard.
  // We run the queries in parallel with Promise.all — the sum of latencies
  // becomes the max of latencies. Cuts the response time roughly by 3.
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [animalsActive, weeklyConsultations, ongoingTreatments] =
        await Promise.all([
          PatientModel.countActive(),
          ConsultationModel.countThisWeek(),
          TraitementModel.countActive(),
        ]);

      return res.status(200).json({
        animaux_suivis: animalsActive,
        consultations_semaine: weeklyConsultations,
        traitements_en_cours: ongoingTreatments,
      });
    } catch (err) {
      next(err);
    }
  }
}