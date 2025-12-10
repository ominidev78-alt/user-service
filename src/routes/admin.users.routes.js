import { Router } from 'express';
import axios from 'axios';
import { userAdminController } from '../controllers/UserAdminController.js';

/**
 * Middleware REAL de autenticação de admin via AUTH-SERVICE
 * URL: https://auth-service.omnigateway.site/api/auth/validate-admin
 */
async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        error: 'MissingAuthorizationHeader',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'InvalidToken',
      });
    }

    const response = await axios.get(
      'https://auth-service.omnigateway.site/api/auth/validate-admin',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data?.ok) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden',
        detail: 'Admin permission required',
      });
    }

    req.admin = response.data.admin;
    next();
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }

    return res.status(500).json({
      ok: false,
      error: 'AdminAuthError',
      detail: err.message,
    });
  }
}

const router = Router();

/**
 * @openapi
 * tags:
 *   name: AdminUsers
 *   description: Gerenciamento de usuários no painel admin
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Lista usuários para o painel admin
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Filtro por nome, email ou documento
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Não permitido
 */
router.get('/admin/users', adminAuth, (req, res, next) => userAdminController.list(req, res, next));

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Detalhes de um usuário
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/admin/users/:id', adminAuth, (req, res, next) =>
  userAdminController.detail(req, res, next)
);

/**
 * @openapi
 * /api/admin/users/{id}/doc-status:
 *   patch:
 *     summary: Atualiza o status de documentação
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/admin/users/:id/doc-status', adminAuth, (req, res, next) =>
  userAdminController.updateDocStatus(req, res, next)
);

/**
 * @openapi
 * /api/admin/users/{id}/treasury-flag:
 *   patch:
 *     summary: Marca o usuário como tesouraria
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isTreasury:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Flag atualizada
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/admin/users/:id/treasury-flag', adminAuth, (req, res, next) =>
  userAdminController.setTreasuryFlag(req, res, next)
);

/**
 * @openapi
 * /api/admin/users/{id}/provider:
 *   patch:
 *     summary: Define ou altera o provider de um usuário
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 nullable: true
 *                 description: |
 *                   Nome do provider: STARPAGO, GATEWAY, MWBank.
 *                   Enviar null para remover o provider atual.
 *     responses:
 *       200:
 *         description: Provider atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/admin/users/:id/provider', adminAuth, (req, res, next) =>
  userAdminController.setProvider(req, res, next)
);

/**
 * @openapi
 * /api/admin/users/{id}/config:
 *   patch:
 *     summary: Atualiza webhook e whitelist de IP
 *     tags:
 *       - AdminUsers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook_url:
 *                 type: string
 *                 nullable: true
 *               ip_whitelist:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Configurações atualizadas
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/admin/users/:id/config', adminAuth, (req, res, next) =>
  userAdminController.updateConfig(req, res, next)
);

export default router;
