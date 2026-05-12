import { Request, Response, NextFunction } from 'express';
import { DossierModel } from '../models/DossierModel';
import { UpdateDossierDTO } from '../validators/dossier';

export class DossierController {
  // GET /api/dossiers
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await DossierModel.findAll();
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/dossiers/:id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const dossier = await DossierModel.findById(id);
      if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

      return res.status(200).json(dossier);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/dossiers/by-patient/:patientId
  // Convenience endpoint for the patient detail page.
  static async getByPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (Number.isNaN(patientId)) return res.status(400).json({ message: 'ID invalide' });

      const dossier = await DossierModel.findByPatient(patientId);
      if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });

      return res.status(200).json(dossier);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/dossiers/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const data = req.body as UpdateDossierDTO;
      const updated = await DossierModel.update(id, data);

      if (!updated) return res.status(404).json({ message: 'Dossier introuvable' });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
}