import express from 'express'
import { userController } from '../controllers/UserController.js'
import { userAuth } from '../middlewares/userAuth.js'

const router = express.Router()

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários do operador.
 */

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso (e carteira BRL criada).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários cadastrados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users', (req, res, next) => userController.create(req, res, next));
router.get('/users', (req, res, next) => userController.list(req, res, next));

/**
 * @openapi
 * /api/users/create-with-deposit:
 *   post:
 *     summary: Cria um novo usuário já com depósito inicial
 *     description: Cria o usuário e já dispara um fluxo de depósito inicial via gateway.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserWithDepositRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com depósito inicial.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *                 payment:
 *                   type: object
 *                   description: Dados retornados do gateway de pagamento.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users/create-with-deposit', (req, res, next) =>
  userController.createWithDeposit(req, res, next)
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Busca detalhes de um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID interno do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/:id', (req, res, next) => userController.get(req, res, next));

/**
 * @openapi
 * /api/users/{id}/credentials:
 *   get:
 *     summary: Obtém as credenciais (appId e clientSecret) de um usuário
 *     description: Retorna as credenciais do operador/usuário para integração com o gateway.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID interno do usuário
 *     responses:
 *       200:
 *         description: Credenciais retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCredentialsResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users/:id/credentials', (req, res, next) =>
  userController.getCredentials(req, res, next)
);

/**
 * @openapi
 * /api/users/{id}/credentials/rotate:
 *   post:
 *     summary: Rotaciona as credenciais (appId e clientSecret) de um usuário
 *     description: Gera novas credenciais no gateway e atualiza o registro do usuário, retornando o novo appId e clientSecret.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID interno do usuário
 *     responses:
 *       200:
 *         description: Novas credenciais geradas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCredentialsResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/users/:id/credentials/rotate', (req, res, next) =>
  userController.rotateCredentials(req, res, next)
);

/**
 * @openapi
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       properties:
 *         appId:
 *           type: string
 *           example: pg_live_892384923849238
 *         clientSecret:
 *           type: string
 *           example: sk_live_5f4dcc3b5aa765d61d8327deb882cf99
 *     UserCredentialsResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UserCredentials'
 */

export default router;
