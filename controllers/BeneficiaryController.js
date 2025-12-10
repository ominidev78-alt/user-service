import BeneficiaryModel from '../models/BeneficiaryModel.js';
import { HttpError } from '../core/HttpError.js';

const BeneficiaryController = {
  async create(req, res, next) {
    try {
      const userId =
        Number(req.params.id) ||
        req.user?.id ||
        Number(req.headers['x-user-id']) ||
        Number(req.query.userId || req.query.user_id);
      if (!userId || !Number.isFinite(userId)) throw new HttpError(400, 'Missing userId');
      const { name, bank_name, document, pix_key, key_type } = req.body;
      if (!name || !pix_key) throw new HttpError(400, 'Name and pix_key required');
      const created = await BeneficiaryModel.create(userId, {
        name,
        bank_name,
        document,
        pix_key,
        key_type,
      });
      res.json(created);
    } catch (err) {
      next(err);
    }
  },
  async list(req, res, next) {
    try {
      const userId =
        Number(req.params.id) ||
        req.user?.id ||
        Number(req.headers['x-user-id']) ||
        Number(req.query.userId || req.query.user_id);
      if (!userId || !Number.isFinite(userId)) throw new HttpError(400, 'Missing userId');
      const list = await BeneficiaryModel.listByUser(userId);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },
  async remove(req, res, next) {
    try {
      const userId =
        Number(req.params.id) ||
        req.user?.id ||
        Number(req.headers['x-user-id']) ||
        Number(req.query.userId || req.query.user_id);
      if (!userId || !Number.isFinite(userId)) throw new HttpError(400, 'Missing userId');
      const { beneficiaryId } = req.params;
      await BeneficiaryModel.remove(userId, beneficiaryId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const userId =
        Number(req.params.id) ||
        req.user?.id ||
        Number(req.headers['x-user-id']) ||
        Number(req.query.userId || req.query.user_id);
      if (!userId || !Number.isFinite(userId)) throw new HttpError(400, 'Missing userId');
      const { beneficiaryId } = req.params;
      if (!beneficiaryId) throw new HttpError(400, 'Missing beneficiaryId');
      const allowed = ['name', 'bank_name', 'document', 'pix_key', 'key_type'];
      const payload = {};
      for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
      }
      const updated = await BeneficiaryModel.update(userId, Number(beneficiaryId), payload);
      if (!updated) throw new HttpError(404, 'NotFound');
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

export default BeneficiaryController;
