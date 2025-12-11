import BeneficiaryModel from '../models/BeneficiaryModel.js';
import { HttpError } from '../core/HttpError.js';
import { UserModel } from '../models/UserModel.js';

const BeneficiaryController = {
  async create(req, res, next) {
    try {
      let userId = Number(req.params.id) || req.user?.id || Number(req.headers['x-user-id']);

      if (!userId || !Number.isFinite(userId)) {
        const appId =
          req.headers['app_id'] ||
          req.headers['app-id'] ||
          req.headers['App_id'] ||
          req.headers['App-Id'];
        const clientId =
          req.headers['client_id'] ||
          req.headers['client-id'] ||
          req.headers['Client_id'] ||
          req.headers['Client-Id'];

        if (appId && clientId) {
          const user = await UserModel.findByAppId(appId);
          if (!user)
            throw new HttpError(401, 'InvalidAppId', {
              message: 'app_id inválido ou não encontrado.',
            });
          if (clientId !== appId && clientId !== user.client_secret) {
            throw new HttpError(401, 'InvalidClientId', {
              message: 'client_id inválido ou não corresponde às credenciais.',
            });
          }
          userId = user.id;
        } else {
          throw new HttpError(400, 'MissingUserId', {
            message: 'userId, app_id e client_id são obrigatórios.',
          });
        }
      }
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
      let userId = Number(req.params.id) || req.user?.id || Number(req.headers['x-user-id']);

      if (!userId || !Number.isFinite(userId)) {
        const appId =
          req.headers['app_id'] ||
          req.headers['app-id'] ||
          req.headers['App_id'] ||
          req.headers['App-Id'];
        const clientId =
          req.headers['client_id'] ||
          req.headers['client-id'] ||
          req.headers['Client_id'] ||
          req.headers['Client-Id'];

        if (appId && clientId) {
          const user = await UserModel.findByAppId(appId);
          if (!user)
            throw new HttpError(401, 'InvalidAppId', {
              message: 'app_id inválido ou não encontrado.',
            });
          if (clientId !== appId && clientId !== user.client_secret) {
            throw new HttpError(401, 'InvalidClientId', {
              message: 'client_id inválido ou não corresponde às credenciais.',
            });
          }
          userId = user.id;
        } else {
          throw new HttpError(400, 'MissingUserId', {
            message: 'userId, app_id e client_id são obrigatórios.',
          });
        }
      }
      const list = await BeneficiaryModel.listByUser(userId);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },
  async remove(req, res, next) {
    try {
      let userId = Number(req.params.id) || req.user?.id || Number(req.headers['x-user-id']);

      if (!userId || !Number.isFinite(userId)) {
        const appId =
          req.headers['app_id'] ||
          req.headers['app-id'] ||
          req.headers['App_id'] ||
          req.headers['App-Id'];
        const clientId =
          req.headers['client_id'] ||
          req.headers['client-id'] ||
          req.headers['Client_id'] ||
          req.headers['Client-Id'];

        if (appId && clientId) {
          const user = await UserModel.findByAppId(appId);
          if (!user)
            throw new HttpError(401, 'InvalidAppId', {
              message: 'app_id inválido ou não encontrado.',
            });
          if (clientId !== appId && clientId !== user.client_secret) {
            throw new HttpError(401, 'InvalidClientId', {
              message: 'client_id inválido ou não corresponde às credenciais.',
            });
          }
          userId = user.id;
        } else {
          throw new HttpError(400, 'MissingUserId', {
            message: 'userId, app_id e client_id são obrigatórios.',
          });
        }
      }
      const { beneficiaryId } = req.params;
      await BeneficiaryModel.remove(userId, beneficiaryId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      let userId = Number(req.params.id) || req.user?.id || Number(req.headers['x-user-id']);

      if (!userId || !Number.isFinite(userId)) {
        const appId =
          req.headers['app_id'] ||
          req.headers['app-id'] ||
          req.headers['App_id'] ||
          req.headers['App-Id'];
        const clientId =
          req.headers['client_id'] ||
          req.headers['client-id'] ||
          req.headers['Client_id'] ||
          req.headers['Client-Id'];

        if (appId && clientId) {
          const user = await UserModel.findByAppId(appId);
          if (!user)
            throw new HttpError(401, 'InvalidAppId', {
              message: 'app_id inválido ou não encontrado.',
            });
          if (clientId !== appId && clientId !== user.client_secret) {
            throw new HttpError(401, 'InvalidClientId', {
              message: 'client_id inválido ou não corresponde às credenciais.',
            });
          }
          userId = user.id;
        } else {
          throw new HttpError(400, 'MissingUserId', {
            message: 'userId, app_id e client_id são obrigatórios.',
          });
        }
      }
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
