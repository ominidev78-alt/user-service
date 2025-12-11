import Joi from 'joi';
import axios from 'axios';
import { HttpError } from '../core/HttpError.js';
import { UserModel } from '../models/UserModel.js';
import { env } from '../config/env.js';

const CNPJ_API = 'https://brasilapi.com.br/api/cnpj/v1';
const WALLET_SERVICE_URL = (env.WALLET_SERVICE_URL || 'http://localhost:3002').replace(/\/+$/, '');

const operatorSchema = Joi.object({
  cnpj: Joi.string().required(),
  partnerName: Joi.string().min(3).required(),

  email: Joi.string().email().allow('', null),
  externalId: Joi.string().allow('', null),

  gatewayFeePercent: Joi.number().min(0).max(100).default(10),

  companyNameOverride: Joi.string().allow('', null),
  tradeNameOverride: Joi.string().allow('', null),
});

export class OperatorController {
  async register(req, res, next) {
    try {
      const { value, error } = operatorSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error)
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map((d) => d.message),
        });

      let cnpj = value.cnpj.replace(/\D/g, '');
      if (cnpj.length !== 14)
        throw new HttpError(400, 'InvalidCNPJ', { message: 'CNPJ deve ter 14 dígitos' });

      let cnpjData;
      try {
        const r = await axios.get(`${CNPJ_API}/${cnpj}`);
        cnpjData = r.data;
      } catch (e) {
        throw new HttpError(400, 'CNPJLookupFailed', {
          error: e.response?.data || e.message,
        });
      }

      const apiRazao = cnpjData.razao_social || cnpjData.nome_empresarial;
      const apiFantasia = cnpjData.nome_fantasia || apiRazao;

      const companyName = value.companyNameOverride || apiRazao;
      const tradeName = value.tradeNameOverride || apiFantasia;

      const gatewayFee = value.gatewayFeePercent;
      const partnerFee = 100 - gatewayFee;

      const user = await UserModel.createOperator({
        name: companyName,
        email: value.email,
        document: cnpj,
        externalId: value.externalId,
        cnpj,
        companyName,
        tradeName,
        partnerName: value.partnerName,
        cnpjData,
        gatewayFeePercent: gatewayFee,
        partnerFeePercent: partnerFee,
      });

      // Call wallet-service to create wallet
      let wallet = null;
      try {
        const walletResp = await axios.get(`${WALLET_SERVICE_URL}/api/users/${user.id}/wallet`, {
          headers: {
            // Internal call, maybe add internal secret if needed later
          },
        });
        wallet = walletResp.data;
      } catch (wErr) {
        console.error(
          '[OperatorController] Failed to create wallet on wallet-service:',
          wErr.message
        );
      }

      return res.status(201).json({
        ok: true,
        operator: {
          id: user.id,
          cnpj,
          companyName,
          tradeName,
          partnerName: user.partner_name,
          docStatus: user.doc_status,
          gatewayFeePercent: user.gateway_fee_percent,
          partnerFeePercent: user.partner_fee_percent,
        },
        wallet,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const operatorController = new OperatorController();
