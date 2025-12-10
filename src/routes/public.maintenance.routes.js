import { Router } from 'express';
import { maintenanceController } from '../controllers/MaintenanceController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: PublicMaintenance
 *   description: Consulta pública do modo manutenção.
 */

/**
 * @openapi
 * /api/public/maintenance:
 *   get:
 *     summary: Consulta se o sistema está em modo manutenção
 *     tags: [PublicMaintenance]
 *     responses:
 *       200:
 *         description: Status do modo manutenção.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/public/maintenance', (req, res, next) =>
  maintenanceController.publicStatus(req, res, next)
);

export default router;
