import { Router } from 'express';
import { operatorController } from '../controllers/OperatorController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Operators
 *   description: Cadastro de operadores / parceiros (CNPJ).
 */

/**
 * @openapi
 * /api/operators:
 *   post:
 *     summary: Cadastra um novo operador (CNPJ)
 *     tags: [Operators]
 *     description: >
 *       Consulta dados do CNPJ via BrasilAPI, calcula split (gateway / parceiro)
 *       e cria o usuário operador + carteira BRL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OperatorCreateRequest'
 *     responses:
 *       201:
 *         description: Operador criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 operator:
 *                   $ref: '#/components/schemas/Operator'
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/operators', (req, res, next) => operatorController.register(req, res, next));

export default router;
