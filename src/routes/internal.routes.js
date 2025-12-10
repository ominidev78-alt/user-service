import { Router } from 'express';
import { userFeeController } from '../controllers/UserFeeController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Internal
 *   description: Rotas internas usadas apenas pelo API Gateway / sistemas da casa.
 */

/**
 * @openapi
 * /api/internal/users/{id}/generate-credentials:
 *   post:
 *     summary: Gera novas credenciais (app_id e client_secret) para o usuário
 *     tags: [Internal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Credenciais geradas com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno.
 */
router.post('/users/:id/generate-credentials', (req, res, next) =>
  authController.generateCredentials(req, res, next)
);

/**
 * @openapi
 * /api/internal/payments/apply-split:
 *   post:
 *     summary: Aplica crédito de depósito pago na carteira do usuário
 *     tags: [Internal]
 */
router.post('/payments/apply-split', (req, res, next) =>
  internalPaymentsController.applySplit(req, res, next)
);

/**
 * @openapi
 * /api/internal/payments/apply-withdraw:
 *   post:
 *     summary: Aplica débito de saque ao usuário
 *     tags: [Internal]
 */
router.post('/payments/apply-withdraw', (req, res, next) =>
  internalPaymentsController.applyWithdraw(req, res, next)
);

/**
 * @openapi
 * /api/internal/users/{id}/fees:
 *   get:
 *     summary: Consulta tarifas Pix do usuário (rota interna)
 *     tags: [Internal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Tarifas atuais do usuário.
 *       400:
 *         description: ID de usuário inválido.
 *       500:
 *         description: Erro interno.
 */
router.get('/users/:id/fees', (req, res, next) =>
  userFeeController.internalGetUserFees(req, res, next)
);

export default router;
