import { Router } from 'express'
import { maintenanceController } from '../controllers/MaintenanceController.js'
import { adminAuth } from '../middlewares/adminAuth.js'

const router = Router()

/**
 * @openapi
 * tags:
 *   name: AdminMaintenance
 *   description: Configurações de modo manutenção do sistema (Pagandu)
 */

router.get(
  '/admin/settings/maintenance',
  adminAuth,
  (req, res, next) => maintenanceController.adminGetStatus(req, res, next)
)

router.patch(
  '/admin/settings/maintenance',
  adminAuth,
  (req, res, next) => maintenanceController.adminToggle(req, res, next)
)

export default router
