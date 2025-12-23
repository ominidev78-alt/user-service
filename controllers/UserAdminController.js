import crypto from 'crypto';
import { pool } from '../config/db.js';
import { UserModel } from '../models/UserModel.js';
import { ProviderModel } from '../models/ProviderModel.js';
import { HttpError } from '../core/HttpError.js';

function generateRandomString(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

export class UserAdminController {
  async list(req, res, next) {
    try {
      const search = (req.query.search || '').trim();
      const limitRaw = req.query.limit;
      const offsetRaw = req.query.offset;

      let limit = Number(limitRaw || 50);
      if (!Number.isFinite(limit) || limit <= 0 || limit > 200) {
        limit = 50;
      }

      let offset = Number(offsetRaw || 0);
      if (!Number.isFinite(offset) || offset < 0) {
        offset = 0;
      }

      const params = [];
      let where = '1=1';

      if (search) {
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        const a = params.length - 2;
        const b = params.length - 1;
        const c = params.length;
        where += ` AND (name ILIKE $${a} OR email ILIKE $${b} OR document ILIKE $${c})`;
      }

      params.push(limit);
      params.push(offset);

      const query = `
        SELECT
          id,
          name,
          email,
          document,
          external_id,
          cnpj,
          company_name,
          trade_name,
          partner_name,
          doc_status,
          gateway_fee_percent,
          partner_fee_percent,
          provider,
          webhook_url,
          ip_whitelist,
          status,
          created_at,
          app_id,
          client_secret
        FROM users
        WHERE ${where}
        ORDER BY id DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;

      const { rows } = await pool.query(query, params);

      return res.json({
        ok: true,
        data: rows,
      });
    } catch (err) {
      return next(err);
    }
  }

  async detail(req, res, next) {
    try {
      const idParam = req.params.id;
      const userId = Number(idParam);

      if (!userId || Number.isNaN(userId)) {
        throw new HttpError(400, 'ValidationError', {
          message: 'userId inválido',
        });
      }

      const { rows } = await pool.query(
        `
          SELECT
            id,
            external_id,
            name,
            email,
            document,
            cnpj,
            company_name,
            trade_name,
            partner_name,
            cnpj_data,
            doc_status,
            doc_status_notes,
            doc_status_updated_at,
            gateway_fee_percent,
            partner_fee_percent,
            status,
            role,
            provider,
            webhook_url,
            ip_whitelist,
            created_at,
            updated_at,
            app_id,
            client_secret
          FROM users
          WHERE id = $1
        `,
        [userId]
      );

      const user = rows[0];
      if (!user) {
        throw new HttpError(404, 'UserNotFound', { userId });
      }

      return res.json({
        ok: true,
        data: user,
      });
    } catch (err) {
      return next(err);
    }
  }
  async setTreasuryFlag(req, res, next) {
    try {
      const idParam = req.params.id;
      const userId = Number(idParam);

      if (!userId || Number.isNaN(userId)) {
        throw new HttpError(400, 'ValidationError', {
          message: 'userId inválido',
        });
      }

      const { isTreasury } = req.body || {};

      if (typeof isTreasury !== 'boolean') {
        throw new HttpError(400, 'ValidationError', {
          message: 'isTreasury deve ser boolean',
        });
      }

      const exists = await UserModel.findById(userId);
      if (!exists) {
        throw new HttpError(404, 'UserNotFound', { userId });
      }

      const updated = await UserModel.setTreasuryFlag(userId, isTreasury);

      return res.json({
        ok: true,
        userId: updated.id,
        is_treasury: updated.is_treasury,
      });
    } catch (err) {
      return next(err);
    }
  }

  async updateDocStatus(req, res, next) {
    try {
      const idParam = req.params.id;
      const userId = Number(idParam);

      if (!userId || Number.isNaN(userId)) {
        throw new HttpError(400, 'ValidationError', {
          message: 'userId inválido',
        });
      }

      const { status, notes } = req.body || {};

      if (!status) {
        throw new HttpError(400, 'ValidationError', {
          message: 'status é obrigatório',
        });
      }

      const updated = await UserModel.updateDocStatus(userId, {
        status,
        notes,
      });

      if (!updated || !updated.id) {
        throw new HttpError(404, 'UserNotFound', { userId });
      }

      let appId = updated.app_id || null;
      let appSecret = null;

      if (status === 'APPROVED' && !updated.app_id) {
        const newAppId = `pg_live_${generateRandomString(8)}`;
        const newAppSecret = `sk_live_${generateRandomString(16)}`;
        const appSecretHash = crypto.createHash('sha256').update(newAppSecret).digest('hex');

        const withCreds = await UserModel.updateCredentials(userId, {
          appId: newAppId,
          appSecretHash,
        });

        if (withCreds && withCreds.app_id) {
          appId = withCreds.app_id;
        } else {
          appId = newAppId;
        }

        appSecret = newAppSecret;
      }

      return res.json({
        ok: true,
        userId: updated.id,
        doc_status: updated.doc_status,
        doc_status_notes: updated.doc_status_notes,
        doc_status_updated_at: updated.doc_status_updated_at,
        appId,
        appSecret,
      });
    } catch (err) {
      return next(err);
    }
  }

  async setProvider(req, res, next) {
    try {
      const idParam = req.params.id;
      const userId = Number(idParam);

      if (!userId || Number.isNaN(userId)) {
        throw new HttpError(400, 'ValidationError', {
          message: 'userId inválido',
        });
      }

      const { provider } = req.body || {};

      // provider pode ser null para remover o provider do usuário
      if (provider !== null && provider !== undefined && typeof provider !== 'string') {
        throw new HttpError(400, 'ValidationError', {
          message: 'provider deve ser uma string ou null',
        });
      }

      const exists = await UserModel.findById(userId);
      if (!exists) {
        throw new HttpError(404, 'UserNotFound', { userId });
      }

      // Se um provider foi informado, validar se ele existe e está ativo
      if (provider && provider.trim() !== '') {
        const providerCode = provider.trim().toUpperCase();
        const providerExists = await ProviderModel.findByCode(providerCode);

        if (!providerExists) {
          throw new HttpError(404, 'ProviderNotFound', {
            message: `Provider com código '${providerCode}' não encontrado`,
          });
        }

        if (!providerExists.active) {
          throw new HttpError(400, 'ProviderInactive', {
            message: `Provider '${providerCode}' está inativo`,
          });
        }

        // Usar o código do provider validado
        const updated = await UserModel.updateProvider(userId, providerCode);

        return res.json({
          ok: true,
          userId: updated.id,
          provider: updated.provider,
        });
      } else {
        // Remover provider do usuário
        const updated = await UserModel.updateProvider(userId, null);

        return res.json({
          ok: true,
          userId: updated.id,
          provider: updated.provider,
        });
      }
    } catch (err) {
      return next(err);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const idParam = req.params.id;
      const userId = Number(idParam);

      if (!userId || Number.isNaN(userId)) {
        throw new HttpError(400, 'ValidationError', {
          message: 'userId inválido',
        });
      }

      const { webhook_url, webhook_url_pix_in, webhook_url_pix_out, ip_whitelist } = req.body || {};

      // Validar webhook_url se fornecido
      if (webhook_url !== null && webhook_url !== undefined && webhook_url !== '') {
        try {
          new URL(webhook_url);
        } catch (e) {
          throw new HttpError(400, 'ValidationError', {
            message: 'webhook_url deve ser uma URL válida',
          });
        }
      }

      // Validar webhook_url_pix_in se fornecido
      if (
        webhook_url_pix_in !== null &&
        webhook_url_pix_in !== undefined &&
        webhook_url_pix_in !== ''
      ) {
        try {
          new URL(webhook_url_pix_in);
        } catch (e) {
          throw new HttpError(400, 'ValidationError', {
            message: 'webhook_url_pix_in deve ser uma URL válida',
          });
        }
      }

      // Validar webhook_url_pix_out se fornecido
      if (
        webhook_url_pix_out !== null &&
        webhook_url_pix_out !== undefined &&
        webhook_url_pix_out !== ''
      ) {
        try {
          new URL(webhook_url_pix_out);
        } catch (e) {
          throw new HttpError(400, 'ValidationError', {
            message: 'webhook_url_pix_out deve ser uma URL válida',
          });
        }
      }

      const exists = await UserModel.findById(userId);
      if (!exists) {
        throw new HttpError(404, 'UserNotFound', { userId });
      }

      const updated = await UserModel.updateConfig(userId, {
        webhook_url: webhook_url || null,
        webhook_url_pix_in: webhook_url_pix_in || null,
        webhook_url_pix_out: webhook_url_pix_out || null,
        ip_whitelist: ip_whitelist || null,
      });

      return res.json({
        ok: true,
        userId: updated.id,
        webhook_url: updated.webhook_url,
        webhook_url_pix_in: updated.webhook_url_pix_in,
        webhook_url_pix_out: updated.webhook_url_pix_out,
        ip_whitelist: updated.ip_whitelist,
      });
    } catch (err) {
      return next(err);
    }
  }
}

export const userAdminController = new UserAdminController();
