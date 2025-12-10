import Joi from 'joi'
import crypto from 'crypto'
import axios from 'axios'
import { UserModel } from '../models/UserModel.js'
import { WalletModel } from '../models/WalletModel.js'
import { HttpError } from '../core/HttpError.js'
import { env } from '../config/env.js'

const userSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().allow('', null),
  document: Joi.string().allow('', null),
  externalId: Joi.string().allow('', null)
})

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

const USER_SERVICE_URL = (env.USER_SERVICE_URL || 'https:/user-service.omnigateway.site').replace(/\/+$/, '')

function generateAppCredentials() {
  const appIdRandom = crypto.randomBytes(8).toString('hex')
  const appId = `mg_live_${appIdRandom}`
  const secretRandom = crypto.randomBytes(16).toString('hex')
  const clientSecret = `sk_live_${secretRandom}`
  return { appId, clientSecret }
}

export class UserController {
  async create(req, res, next) {
    try {
      const { value, error } = userSchema.validate(req.body, {
        abortEarly: false
      })
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map(d => d.message)
        })
      }

      const { appId, clientSecret } = generateAppCredentials()

      const user = await UserModel.create({
        ...value,
        appId,
        clientSecret
      })

      const wallet = await WalletModel.createUserWallet(user.id, 'BRL')

      return res.status(201).json({
        ok: true,
        user,
        wallet
      })
    } catch (err) {
      next(err)
    }
  }

  async list(req, res, next) {
    try {
      const users = await UserModel.findAll()
      return res.json({ ok: true, data: users })
    } catch (err) {
      next(err)
    }
  }

  async get(req, res, next) {
    try {
      const id = Number(req.params.id)
      const user = await UserModel.findById(id)
      if (!user) throw new HttpError(404, 'UserNotFound')
      return res.json({ ok: true, data: user })
    } catch (err) {
      next(err)
    }
  }

  async getCredentials(req, res, next) {
    try {
      const { value, error } = idParamSchema.validate(req.params)
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map(d => d.message)
        })
      }

      const id = value.id
      const user = await UserModel.findById(id)
      if (!user) throw new HttpError(404, 'UserNotFound', { userId: id })

      let appId = user.app_id || user.appId || user.client_id || null
      let clientSecret = user.client_secret || user.clientSecret || null

      if (!appId || !clientSecret) {
        const generated = await UserModel.generateAndUpdateCredentials(id)
        appId = generated.appId
        clientSecret = generated.clientSecret
      }

      return res.json({
        ok: true,
        data: {
          app_id: appId,
          client_secret: clientSecret
        }
      })
    } catch (err) {
      next(err)
    }
  }

  async rotateCredentials(req, res, next) {
    try {
      const { value, error } = idParamSchema.validate(req.params)
      if (error) {
        throw new HttpError(400, 'ValidationError', {
          details: error.details.map(d => d.message)
        })
      }

      const id = value.id

      const user = await UserModel.findById(id)
      if (!user) {
        throw new HttpError(404, 'UserNotFound', { userId: id })
      }

      const url = `${USER_SERVICE_URL}/api/internal/operators/${id}/generate-credentials`

      const gwResp = await axios.post(url, {})
      const gwData = gwResp.data || {}

      const appId =
        gwData.appId || gwData.app_id || gwData.client_id || null
      const clientSecret =
        gwData.clientSecret ||
        gwData.appSecret ||
        gwData.client_secret ||
        gwData.secret ||
        null

      if (!appId || !clientSecret) {
        throw new HttpError(500, 'GatewayError', {
          message: 'Resposta inválida ao gerar credenciais'
        })
      }

      await UserModel.updateCredentials(id, {
        appId,
        clientSecret
      })

      return res.json({
        ok: true,
        data: {
          app_id: appId,
          client_secret: clientSecret
        }
      })
    } catch (err) {
      next(err)
    }
  }
}

export const userController = new UserController()
