import { Router } from 'express'
import { healthController } from '../controllers/HealthController.js'

const router = Router()

/**
 * @openapi
 * tags:
 *   name: Health
 *   description: Status do microserviço.
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica saúde do serviço
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serviço respondendo normalmente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', (req, res, next) =>
  healthController.health(req, res, next)
)


router.get('/', (req, res, next) =>
  healthController.health(req, res, next)
)

export default router
