import Joi from 'joi';
import crypto from 'crypto';
import axios from 'axios';
import { UserModel } from '../models/UserModel.js';
import { HttpError } from '../core/HttpError.js';
import { env } from '../config/env.js';

const userSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow('', null),
  document: Joi.string().allow('', null),
  externalId: Joi.string().allow('', null),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const AUTH_SERVICE_URL = (env.AUTH_SERVICE_URL || 'http://localhost:3001').replace(/\/+$/, '');
const WALLET_SERVICE_URL = (env.WALLET_SERVICE_URL || 'http://localhost:3002').replace(/\/+$/, '');

function generateAppCredentials() {
  const appIdRandom = crypto.randomBytes(8).toString('hex');
  const appId = `mg_live_${appIdRandom}`;
  const secretRandom = crypto.randomBytes(16).toString('hex');
  const clientSecret = `sk_live_${secretRandom}`;
  return { appId, clientSecret };
}

export class UserController {
  async create(req, res, next) {
    try {
      const { value, error } = userSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map((d) => d.message),
        });
      }

      const { appId, clientSecret } = generateAppCredentials();

      const user = await UserModel.create({
        ...value,
        appId,
        clientSecret,
      });

      // Call wallet-service to create wallet
      let wallet = null;
      try {
        // We use the internal or public endpoint to ensure wallet creation
        // Using GET /users/:id/wallet creates it if not exists
        const walletResp = await axios.get(`${WALLET_SERVICE_URL}/api/users/${user.id}/wallet`, {
          headers: {
            app_id: appId,
            client_id: clientSecret,
          },
        });
        wallet = walletResp.data;
      } catch (wErr) {
        console.error('[UserController] Failed to create wallet on wallet-service:', wErr.message);
      }

      return res.status(201).json({
        ok: true,
        user,
        wallet,
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const users = await UserModel.findAll();
      return res.json({ ok: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  async get(req, res, next) {
    try {
      const id = Number(req.params.id);
      const user = await UserModel.findById(id);
      if (!user) throw new HttpError(404, 'UserNotFound');
      return res.json({ ok: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async getCredentials(req, res, next) {
    try {
      const { value, error } = idParamSchema.validate(req.params);
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map((d) => d.message),
        });
      }

      const id = value.id;
      const user = await UserModel.findById(id);
      if (!user) throw new HttpError(404, 'UserNotFound', { userId: id });

      let appId = user.app_id || user.appId || user.client_id || null;
      let clientSecret = user.client_secret || user.clientSecret || null;

      if (!appId || !clientSecret) {
        const generated = await UserModel.generateAndUpdateCredentials(id);
        appId = generated.appId;
        clientSecret = generated.clientSecret;
      }

      return res.json({
        ok: true,
        data: {
          app_id: appId,
          client_secret: clientSecret,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async rotateCredentials(req, res, next) {
    try {
      const { value, error } = idParamSchema.validate(req.params);
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map((d) => d.message),
        });
      }

      const id = value.id;

      const user = await UserModel.findById(id);
      if (!user) {
        throw new HttpError(404, 'UserNotFound', { userId: id });
      }

      // Call auth-service to generate credentials
      // Assuming auth-service has /api/internal/users/:id/generate-credentials
      const url = `${AUTH_SERVICE_URL}/api/internal/users/${id}/generate-credentials`;

      const gwResp = await axios.post(url, {});
      const gwData = gwResp.data || {};

      const appId = gwData.appId || gwData.app_id || gwData.client_id || null;
      const clientSecret =
        gwData.clientSecret || gwData.appSecret || gwData.client_secret || gwData.secret || null;

      if (!appId || !clientSecret) {
        throw new HttpError(500, 'GatewayError', {
          message: 'Resposta inválida ao gerar credenciais',
        });
      }

      // Update local user model if needed, but auth-service should have updated the DB since they share it.
      // But to be safe and get fresh data:
      const updatedUser = await UserModel.findById(id);

      return res.json({
        ok: true,
        data: {
          app_id: updatedUser.app_id,
          client_secret: clientSecret, // clientSecret is usually not stored in plain text in DB, so we use the one returned
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
