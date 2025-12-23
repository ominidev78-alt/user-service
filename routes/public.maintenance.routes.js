import { Router } from 'express'
import { maintenanceController } from '../controllers/MaintenanceController.js'

const router = Router()

/**
 * @openapi
 * tags:
 *   name: PublicMaintenance
 *   description: Consulta pública do modo manutenção (Pagandu)
 */

router.get(
  '/public/maintenance',
  (req, res, next) => maintenanceController.publicStatus(req, res, next)
)

export default router
