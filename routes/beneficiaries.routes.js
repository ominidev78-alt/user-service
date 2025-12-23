import express from 'express'
import BeneficiaryController from '../controllers/BeneficiaryController.js'
import { userAuth } from '../middlewares/userAuth.js'

const router = express.Router()

/**
 * @openapi
 * tags:
 *   name: Beneficiaries
 *   description: Gerenciamento de favorecidos para Pix (Pagandu)
 */

// Rotas internas/admin (passa :id na URL)
router.post('/users/:id/beneficiaries', BeneficiaryController.create)
router.get('/users/:id/beneficiaries', BeneficiaryController.list)
router.delete('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.remove)
router.put('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.update)
router.patch('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.update)

// Rotas autenticadas (usa req.user.id do JWT)
router.post('/beneficiaries', userAuth, BeneficiaryController.create)
router.get('/beneficiaries', userAuth, BeneficiaryController.list)
router.delete('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.remove)
router.put('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update)
router.patch('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update)

// Rotas públicas via Header app_id/client_id
router.post('/beneficiaries-public', BeneficiaryController.create)
router.get('/beneficiaries-public', BeneficiaryController.list)
router.delete('/beneficiaries-public/:beneficiaryId', BeneficiaryController.remove)
router.put('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update)
router.patch('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update)

export default router
