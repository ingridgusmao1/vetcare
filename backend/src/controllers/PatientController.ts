import { Request, Response, NextFunction } from 'express';
import { PatientModel } from '../models/PatientModel';
import { ProprietaireModel } from '../models/ProprietaireModel';
import {
  CreatePatientDTO,
  UpdatePatientDTO,
  FindPatientsQueryDTO,
} from '../validators/patient';

export class PatientController {
  // GET /api/patients?search=&espece=&actif=
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query as unknown as FindPatientsQueryDTO;
      const patients = await PatientModel.findAll(filter);
      return res.status(200).json(patients);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/patients/:id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const patient = await PatientModel.findById(id);
      if (!patient) return res.status(404).json({ message: 'Patient introuvable' });

      return res.status(200).json(patient);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/patients
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreatePatientDTO;

      // Validate the FK before INSERT — prevents a 500 from the FK constraint.
      const owner = await ProprietaireModel.findById(data.proprietaire_id);
      if (!owner) {
        return res.status(400).json({ message: 'Propriétaire inexistant' });
      }

      // PatientModel.create runs the transaction that inserts patient + dossier.
      const created = await PatientModel.create(data);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/patients/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const data = req.body as UpdatePatientDTO;

      // If proprietaire_id is being changed, double-check it exists.
      if (data.proprietaire_id) {
        const owner = await ProprietaireModel.findById(data.proprietaire_id);
        if (!owner) {
          return res.status(400).json({ message: 'Propriétaire inexistant' });
        }
      }

      const updated = await PatientModel.update(id, data);
      if (!updated) return res.status(404).json({ message: 'Patient introuvable' });

      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/patients/:id  → soft delete (US-08)
  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const updated = await PatientModel.softDelete(id);
      if (!updated) return res.status(404).json({ message: 'Patient introuvable' });

      // 200 with the updated row so the UI can mark it inactive instantly.
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
}