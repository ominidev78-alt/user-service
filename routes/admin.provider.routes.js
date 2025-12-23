import express from 'express'
import { providerAdminController } from '../controllers/ProviderAdminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const router = express.Router()

/**
 * @openapi
 * tags:
 *   name: AdminProviders
 *   description: "Gerenciamento de providers no painel admin"
 */

/**
 * @openapi
 * /api/admin/providers:
 *   get:
 *     summary: Lista providers
 *     tags:
 *       - AdminProviders
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           description: "Filtrar por providers ativos ou inativos"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: "Busca por nome ou código"
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
 *         description: "Lista de providers retornada com sucesso"
 *       401:
 *         description: "Não autorizado"
 *       403:
 *         description: "Não permitido (somente admin)"
 */
router.get('/admin/providers', adminAuth, (req, res, next) =>
  providerAdminController.list(req, res, next)
);

/**
 * @openapi
 * /api/admin/providers/{id}:
 *   get:
 *     summary: Detalhes de um provider
 *     tags:
 *       - AdminProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Dados do provider"
 *       404:
 *         description: "Provider não encontrado"
 */
router.get('/admin/providers/:id', adminAuth, (req, res, next) =>
  providerAdminController.detail(req, res, next)
);

/**
 * @openapi
 * /api/admin/providers:
 *   post:
 *     summary: Cria um novo provider
 *     tags:
 *       - AdminProviders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 description: "Código único do provider (ex: STARPAGO, GATEWAY)"
 *               name:
 *                 type: string
 *                 description: "Nome do provider"
 *               base_url:
 *                 type: string
 *                 description: "URL base do provider"
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: "Se o provider está ativo"
 *     responses:
 *       201:
 *         description: "Provider criado com sucesso"
 *       400:
 *         description: "Erro de validação"
 *       409:
 *         description: "Código do provider já existe"
 */
router.post('/admin/providers', adminAuth, (req, res, next) =>
  providerAdminController.create(req, res, next)
);

/**
 * @openapi
 * /api/admin/providers/{id}:
 *   put:
 *     summary: Atualiza um provider
 *     tags:
 *       - AdminProviders
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
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               base_url:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: "Provider atualizado com sucesso"
 *       400:
 *         description: "Erro de validação"
 *       404:
 *         description: "Provider não encontrado"
 *       409:
 *         description: "Código do provider já existe"
 */
router.put('/admin/providers/:id', adminAuth, (req, res, next) =>
  providerAdminController.update(req, res, next)
);

/**
 * @openapi
 * /api/admin/providers/{id}/status:
 *   patch:
 *     summary: Altera o status de um provider
 *     tags:
 *       - AdminProviders
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
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: "true para ativar, false para desativar"
 *     responses:
 *       200:
 *         description: "Status atualizado com sucesso"
 *       400:
 *         description: "Erro de validação"
 *       404:
 *         description: "Provider não encontrado"
 */
router.patch('/admin/providers/:id/status', adminAuth, (req, res, next) =>
  providerAdminController.updateStatus(req, res, next)
);

/**
 * @openapi
 * /api/admin/providers/{id}:
 *   delete:
 *     summary: Remove um provider
 *     tags:
 *       - AdminProviders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "Provider removido com sucesso"
 *       404:
 *         description: "Provider não encontrado"
 */
router.delete('/admin/providers/:id', adminAuth, (req, res, next) =>
  providerAdminController.delete(req, res, next)
);

export default router;
