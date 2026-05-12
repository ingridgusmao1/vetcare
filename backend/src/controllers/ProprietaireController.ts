import { Request, Response, NextFunction } from 'express';
import { ProprietaireModel } from '../models/ProprietaireModel';
import {
  CreateProprietaireDTO,
  UpdateProprietaireDTO,
} from '../validators/proprietaire';

export class ProprietaireController {
  // GET /api/proprietaires
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const owners = await ProprietaireModel.findAll();
      return res.status(200).json(owners);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/proprietaires/:id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      // parseInt protects against unexpected URL types. Validation should also
      // happen via a params zod schema, but defense-in-depth here is cheap.
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const owner = await ProprietaireModel.findById(id);
      if (!owner) return res.status(404).json({ message: 'Propriétaire introuvable' });

      return res.status(200).json(owner);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/proprietaires/:id/animals  → owner's pets
  static async getAnimals(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      // Ensure owner exists so we send 404 instead of an empty list, which
      // is more accurate semantically.
      const owner = await ProprietaireModel.findById(id);
      if (!owner) return res.status(404).json({ message: 'Propriétaire introuvable' });

      const animals = await ProprietaireModel.findAnimals(id);
      return res.status(200).json(animals);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/proprietaires
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateProprietaireDTO;

      // Pre-check duplicate email for a friendly 409 instead of a 500.
      const existing = await ProprietaireModel.findByEmail(data.email);
      if (existing) return res.status(409).json({ message: 'Email déjà utilisé' });

      const created = await ProprietaireModel.create(data);
      // 201 Created + the new resource. The frontend can put it directly
      // into local state without re-fetching the list.
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/proprietaires/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      const data = req.body as UpdateProprietaireDTO;
      const updated = await ProprietaireModel.update(id, data);

      if (!updated) return res.status(404).json({ message: 'Propriétaire introuvable' });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/proprietaires/:id
  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID invalide' });

      // Confirm existence before delete — improves error messages.
      const existing = await ProprietaireModel.findById(id);
      if (!existing) return res.status(404).json({ message: 'Propriétaire introuvable' });

      await ProprietaireModel.remove(id);
      // 204 No Content: success, but no payload to return.
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}