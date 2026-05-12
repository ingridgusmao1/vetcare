import { Request, Response, NextFunction } from 'express';
import { TraitementModel } from '../models/TraitementModel';
import { PatientModel } from '../models/PatientModel';
import { DossierModel } from '../models/DossierModel';
import {
  CreateTraitementDTO,
  UpdateTraitementDTO,
  FindTraitementsQueryDTO,
} from '../validators/traitement';

export class TraitementController {
  // GET /api/traitements
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query as unknown as FindTraitementsQueryDTO;
      const list = await TraitementModel.findAll(filter);
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/traitements/:id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const t = await TraitementModel.findById(id);
      if (!t) return res.status(404).json({ message: 'Traitement introuvable' });

      return res.status(200).json(t);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/traitements/active-by-patient/:patientId  (US-16)
  static async getActiveByPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (Number.isNaN(patientId)) return res.status(400).json({ message: 'ID invalide' });

      const list = await TraitementModel.findActiveByPatient(patientId);
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/traitements
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateTraitementDTO;

      // FK validation — patient must exist; dossier optional.
      const patient = await PatientModel.findById(data.patient_id);
      if (!patient) return res.status(400).json({ message: 'Patient inexistant' });

      if (data.dossier_id) {
        const dossier = await DossierModel.findById(data.dossier_id);
        if (!dossier) return res.status(400).json({ message: 'Dossier inexistant' });
      }

      const created = await TraitementModel.create(data);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/traitements/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const data = req.body as UpdateTraitementDTO;
      const updated = await TraitementModel.update(id, data);

      if (!updated) return res.status(404).json({ message: 'Traitement introuvable' });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/traitements/:id
  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const existing = await TraitementModel.findById(id);
      if (!existing) return res.status(404).json({ message: 'Traitement introuvable' });

      await TraitementModel.remove(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}