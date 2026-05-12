import { Request, Response, NextFunction } from 'express';
import { ConsultationModel } from '../models/ConsultationModel';
import { PatientModel } from '../models/PatientModel';
import { UserModel } from '../models/UserModel';
import {
  CreateConsultationDTO,
  UpdateConsultationDTO,
  UpdateStatusDTO,
  FindConsultationsQueryDTO,
} from '../validators/consultation';

export class ConsultationController {
  // GET /api/consultations
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query as unknown as FindConsultationsQueryDTO;
      const list = await ConsultationModel.findAll(filter);
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/consultations/:id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const consultation = await ConsultationModel.findById(id);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }

      return res.status(200).json(consultation);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/consultations/by-patient/:patientId
  static async getByPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (Number.isNaN(patientId)) return res.status(400).json({ message: 'ID invalide' });

      const list = await ConsultationModel.findByPatient(patientId);
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/consultations
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateConsultationDTO;

      // FK sanity checks — friendlier than a DB constraint error.
      const patient = await PatientModel.findById(data.patient_id);
      if (!patient) return res.status(400).json({ message: 'Patient inexistant' });

      const vet = await UserModel.findById(data.veterinaire_id);
      if (!vet) return res.status(400).json({ message: 'Vétérinaire inexistant' });

      // Business rule: only veterinarians can be assigned, not assistants.
      if (vet.role !== 'veterinaire' && vet.role !== 'administrateur') {
        return res
          .status(400)
          .json({ message: 'L’utilisateur assigné doit être un vétérinaire' });
      }

      const created = await ConsultationModel.create(data);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/consultations/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const data = req.body as UpdateConsultationDTO;
      const updated = await ConsultationModel.update(id, data);

      if (!updated) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/consultations/:id/status   (US-12)
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const { status } = req.body as UpdateStatusDTO;

      // Business rule from cahier US-12: a vet can only update their own
      // consultations. An admin can update any.
      if (req.user && req.user.role === 'veterinaire') {
        const existing = await ConsultationModel.findById(id);
        if (!existing) return res.status(404).json({ message: 'Consultation introuvable' });
        if (existing.veterinaire_id !== req.user.sub) {
          return res
            .status(403)
            .json({ message: 'Vous ne pouvez modifier que vos propres consultations' });
        }
      }
      
      if (!status) {
        return res.status(400).json({ message: 'Le statut est obligatoire' });
      }

      const updated = await ConsultationModel.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: 'Consultation introuvable' });
      }
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/consultations/:id   (admin only — see route)
  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const existing = await ConsultationModel.findById(id);
      if (!existing) return res.status(404).json({ message: 'Consultation introuvable' });

      await ConsultationModel.remove(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}